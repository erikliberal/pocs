package io.plenusoft.main;

import org.apache.tomee.embedded.Configuration;
import org.apache.tomee.embedded.Container;
import sun.security.x509.AlgorithmId;
import sun.security.x509.CertificateAlgorithmId;
import sun.security.x509.CertificateSerialNumber;
import sun.security.x509.CertificateValidity;
import sun.security.x509.CertificateVersion;
import sun.security.x509.CertificateX509Key;
import sun.security.x509.X500Name;
import sun.security.x509.X509CertImpl;
import sun.security.x509.X509CertInfo;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.math.BigInteger;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.security.GeneralSecurityException;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.SecureRandom;
import java.security.cert.Certificate;
import java.security.cert.X509Certificate;
import java.util.Date;

public class Main {

    private static X509Certificate generateCertificate(String dn, KeyPair keyPair, int validity) throws GeneralSecurityException, IOException {
        PrivateKey privateKey = keyPair.getPrivate();

        X509CertInfo info = new X509CertInfo();

        Date from = new Date();
        Date to = new Date(from.getTime() + validity * 1000L * 24L * 60L * 60L);

        CertificateValidity interval = new CertificateValidity(from, to);
        BigInteger serialNumber = new BigInteger(64, new SecureRandom());
        X500Name owner = new X500Name(dn);
        AlgorithmId sigAlgId = new AlgorithmId(AlgorithmId.md5WithRSAEncryption_oid);

        info.set(X509CertInfo.VALIDITY, interval);
        info.set(X509CertInfo.SERIAL_NUMBER, new CertificateSerialNumber(serialNumber));
        info.set(X509CertInfo.SUBJECT, owner);
        info.set(X509CertInfo.ISSUER, owner);
        info.set(X509CertInfo.KEY, new CertificateX509Key(keyPair.getPublic()));
        info.set(X509CertInfo.VERSION, new CertificateVersion(CertificateVersion.V3));
        info.set(X509CertInfo.ALGORITHM_ID, new CertificateAlgorithmId(sigAlgId));

        // Sign the cert to identify the algorithm that's used.
        X509CertImpl certificate = new X509CertImpl(info);
        certificate.sign(privateKey, sigAlgId.getName());

        return certificate;
    }

    public static void main(String[]args){
        Configuration config = new Configuration();
        config.property("java.naming.factory.initial ", "org.apache.openejb.client.LocalInitialContextFactory");
        config.property("openejb.descriptors.output", "true");
        config.property("openejb.validation.output.level", "verbose");

        selfSignedSslConfig(config);

        try(Container container = new Container(config).deployClasspathAsWebApp()) {
            System.out.println("Started on http://localhost: " + config.getHttpPort());
            System.out.println("Started on https://localhost: " + config.getHttpsPort());
            String baseFolder = System.getProperty("catalina.base");
            System.out.println("Folder "+baseFolder);
            Runtime.getRuntime().addShutdownHook(new Thread(()-> removeRecursively(baseFolder)));
            container.await();
        }

    }

    private static void selfSignedSslConfig(Configuration config) {
        try {
            File keystoreFile = File.createTempFile("keystore", "tmp");
            Files.deleteIfExists(keystoreFile.toPath());
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
            keyPairGenerator.initialize(4096);
            KeyPair keyPair = keyPairGenerator.generateKeyPair();

            Certificate[] chain = {generateCertificate("cn=Unknown", keyPair, 365)};

            KeyStore ks = KeyStore.getInstance("pkcs12");
            String keystorePass = "changeit";
            char[] password = keystorePass.toCharArray();
            ks.load(null, password);
            try (FileOutputStream fos = new FileOutputStream(keystoreFile)){
                ks.setKeyEntry("tomcat", keyPair.getPrivate(), password, chain);
                ks.store(fos, password);
            }

            config.setSsl(true);
            config.setKeystoreFile(keystoreFile.getAbsolutePath());
            config.setKeyAlias("tomcat");
            config.setKeystorePass(keystorePass);
            config.setKeystoreType("pkcs12");
            config.setClientAuth("false");
            config.setSslProtocol("TLS");
        } catch (IOException | GeneralSecurityException e) {
            System.out.println("Failed to configure SSL");
        }
    }

    private static void removeRecursively(String baseFolder) {
        try {
            Files.walkFileTree(Paths.get(baseFolder), new SimpleFileVisitor<Path>(){
                @Override
                public FileVisitResult visitFile(Path path, BasicFileAttributes basicFileAttributes) throws IOException {
                    Files.delete(path);
                    return FileVisitResult.CONTINUE;
                }
                @Override
                public FileVisitResult postVisitDirectory(Path path, IOException e) throws IOException {
                    Files.delete(path);
                    return FileVisitResult.CONTINUE;
                }
            });
        } catch (IOException e) {
            System.out.println("Failed to remove folder "+baseFolder);
        }
    }

}

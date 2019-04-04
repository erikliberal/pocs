package io.plenusoft.main;

//import org.apache.tomee.embedded.Configuration;
//import org.apache.tomee.embedded.Container;

import io.plenusoft.fileUpload.ServletFileUpload;
import org.apache.tomee.embedded.Configuration;
import org.apache.tomee.embedded.Container;

public class Main {

    public static void main(String[]args){
        Configuration config = new Configuration();
        config.property("java.naming.factory.initial ", "org.apache.openejb.client.LocalInitialContextFactory");
        config.property("openejb.descriptors.output", "true");
        config.property("openejb.validation.output.level", "verbose");

        try(Container container = new Container(config).deployClasspathAsWebApp()) {
            System.out.println("Started on http://localhost: " + config.getHttpPort());
            container.await();
        }

    }

}

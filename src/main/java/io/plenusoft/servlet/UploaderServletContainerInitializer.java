package io.plenusoft.servlet;


import io.plenusoft.fileUpload.ServletFileUpload;

import javax.servlet.MultipartConfigElement;
import javax.servlet.ServletContainerInitializer;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRegistration;
import javax.servlet.ServletRegistration.Dynamic;
import java.util.Set;

public class UploaderServletContainerInitializer implements ServletContainerInitializer {
    @Override
    public void onStartup(Set<Class<?>> c, ServletContext ctx) throws ServletException {
        configureMultipartServlet(ctx);
    }

    private void configureMultipartServlet(ServletContext ctx) {
        Dynamic multiPartServlet = ctx.addServlet("MultiPartServlet", ServletFileUpload.class);
        multiPartServlet.setLoadOnStartup(1);
        int maxFileSize = -1;//1024 * 1024 * 5;
        int maxRequestSize = -1;//1024 * 1024 * 5 * 5;
        int fileSizeThreshold = 0;//1024 * 1024;
        multiPartServlet.setMultipartConfig(new MultipartConfigElement("", maxFileSize,
                maxRequestSize, fileSizeThreshold));
        multiPartServlet.addMapping("/multiPartServlet");
    }
}

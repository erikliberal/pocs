package io.plenusoft.fileUpload;

import org.apache.tomcat.util.http.fileupload.IOUtils;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.Optional;

public class ServletFileUpload extends HttpServlet {
    private String getFileName(Part part) {
        for (String content : part.getHeader("content-disposition").split(";")) {
            if (content.trim().startsWith("filename"))
                return content.substring(content.indexOf("=") + 2, content.length() - 1);
        }
        return "default.file";
    }
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String tempDir=Optional.ofNullable(getServletContext().getAttribute("javax.servlet.context.tempdir")).map(Object::toString)
            .orElseGet(()->System.getProperty("java.io.tmp"));
        Path uploadPath = Paths.get(tempDir).resolve("upload");
        //String uploadPath = getServletContext().getRealPath("") + File.separator + "upload";
        for(String headerName : Collections.list(request.getHeaderNames())){
            System.out.println(headerName+" : "+Collections.list(request.getHeaders(headerName)));
        }
        System.out.println(uploadPath);
        File uploadDir = uploadPath.toFile();
        if (!uploadDir.exists()) {
            uploadDir.mkdir();
        }

        try {
            String fileName = "";

            for (Part part : request.getParts()) {
                fileName = getFileName(part);
                part.write(uploadPath + File.separator + fileName);
            }
            request.setAttribute("message", "File " + fileName + " has uploaded successfully!");
        } catch (FileNotFoundException fne) {
            request.setAttribute("message", "There was an error: " + fne.getMessage());
        }
        response.sendRedirect("/index.html");
    }
}

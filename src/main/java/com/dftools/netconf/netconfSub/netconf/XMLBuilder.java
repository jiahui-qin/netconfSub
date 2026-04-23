package com.dftools.netconf.netconfSub.netconf;

import org.w3c.dom.DOMImplementation;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.util.ArrayList;


public class XMLBuilder {

    private final DOMImplementation impl;
    private final DocumentBuilder builder;

    public XMLBuilder() throws ParserConfigurationException {
        DocumentBuilderFactory documentBuilderFactory = DocumentBuilderFactory.newInstance();
        builder = documentBuilderFactory.newDocumentBuilder();
        impl = builder.getDOMImplementation();
    }

    public XML createEidtConfig(ArrayList<String> cliList) {
        Document doc = impl.createDocument("urn:pcl:params:xml:ns:yang:pcl-execute-cli", "cli", null);
        Element rootElement = doc.getDocumentElement();

        StringBuffer cliBuff = new StringBuffer();

        cliList.forEach(cli -> {
            cliBuff.append("\n\t\t\t");
            cliBuff.append(cli);
        });
        cliBuff.append("\n\t\t");

        XML xml = new XML(rootElement);
        xml = xml.append("cli");
        xml.append("name", "01");
        xml.append("execute-cli", cliBuff.toString());
        return xml;
    }

}

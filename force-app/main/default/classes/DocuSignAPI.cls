public class DocuSignAPI {
    
     public static void getToken() {
        // Instantiate a new Http object
    Http h = new Http();

    // Instantiate a new HTTP request
    // Specify request properties such as the endpoint, the POST method, etc. 
    HttpRequest req = new HttpRequest();
    req.setEndpoint(' https://account-d.docusign.com/oauth/token');
    req.setMethod('POST');
    req.setHeader('Content-Type', 'application/json');
    req.setHeader('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer&');
    req.setBody('assertion=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9');
         
    // Send the request, and return a response
    HttpResponse res = h.send(req);
         system.debug(res.getBody());
 }

}
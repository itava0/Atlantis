public class authToken {
    
     public static Object getToken() {
        // Instantiate a new Http object
    Http h = new Http();

    // Instantiate a new HTTP request
    // Specify request properties such as the endpoint, the POST method, etc. 
    HttpRequest req = new HttpRequest();
    req.setEndpoint('https://sandbox-us-api.experian.com/oauth2/v1/token');
    req.setMethod('POST');
    req.setHeader('Content-Type', 'application/json');
    req.setHeader('Accept', 'application/json');
    req.setHeader('grant_type', 'password');
    req.setBody('{"username": "itavare01@gmail.com","password": "199526Ivan@1","client_id": "AownthkGS3tfNh7GzKdZUdF2GyO3kcGG","client_secret": "cTGcFT9TlsQkjg78"}');

    // Send the request, and return a response
    HttpResponse res = h.send(req);
    Map<String, Object> m2 = (Map<String, Object>)JSON.deserializeUntyped(res.getBody());
     return m2.get('access_token');
}
}
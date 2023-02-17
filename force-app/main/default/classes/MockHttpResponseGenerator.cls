@isTest
global class MockHttpResponseGenerator implements HttpCalloutMock {
    // Implement this interface method
    global HTTPResponse respond(HTTPRequest req) {
        String geoAddress = EncodingUtil.urlEncode('400 Broad St, Seattle, Washington, United States of America, 98109', 'UTF-8');
        System.assertEquals('https://maps.googleapis.com/maps/api/geocode/json?address=' + geoAddress + '&key=AIzaSyDnGBdEG1XOodEdlPwRnqaFA5PRG2xnbFc&sensor=false', req.getEndpoint());
        System.assertEquals('GET', req.getMethod());
        
        // Create a fake response
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setBody('{"example":"test"}');
        res.setStatusCode(200);
        return res;
    }
}
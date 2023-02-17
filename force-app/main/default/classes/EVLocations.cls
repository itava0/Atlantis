public with sharing class EVLocations {
    @AuraEnabled
    public static String getChargingStations(Decimal lat, Decimal lon) {
        //Get nearest charging stations from openchargemap.org
        Http h = new Http();
        HttpRequest req = new HttpRequest();
        String key = 'fb1a44b5-f2cd-47ef-b294-977dab61a4a6';
        req.setEndpoint('https://api.openchargemap.io/v3/poi/?output=json&latitude=' + lat + '&longitude=' + lon + '&maxresults=10&distanceunit=Miles&distance=100&opendata=true&countrycode=US&verbose=false&compact=true&key=' + key);
        req.setMethod('GET');
        HttpResponse res = h.send(req);
        return res.getBody();
    }
}
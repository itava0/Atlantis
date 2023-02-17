public with sharing class RSSFeed {
    @AuraEnabled
    public static List<String> fetchFeed() {
        List<String> url = new List<String>{'https://theatlantavoice.com/feed/','https://atlantadailyworld.com/feed/'};
        //Fetch the RSS feed
        List<String> body = new List<String>();
        for(String u : url){
            HttpRequest req = new HttpRequest();
            req.setEndpoint(u);
            req.setMethod('GET');
            Http http = new Http();
            HttpResponse res = http.send(req);
            //Parse the RSS feed
            body.add(res.getBody());
        }
        return body;
    }
}
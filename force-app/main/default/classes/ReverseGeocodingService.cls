public with sharing class ReverseGeocodingService {
  @auraEnabled(cacheable=true)
  public static String ReverseGeocode(String latitude, String longitude) {
    //Reverse geocode the latitude and longitude with opencage data api
    String geoKey = '428138c31adb4ba6b86339a9440d87e7';
    String url =
      'https://api.opencagedata.com/geocode/v1/json?q=' +
      latitude +
      '+' +
      longitude +
      '&key=' +
      geoKey;

    HttpRequest req = new HttpRequest();
    req.setEndpoint(url);
    req.setMethod('GET');
    Http http = new Http();
    HttpResponse res = http.send(req);
    String response = res.getBody();
    System.debug(response);
    //Parse the response
    JSONParser parser = JSON.createParser(response);
    String formattedAddress = '';
    while (parser.nextToken() != null) {
      //get city, state, zip, and street
      if (
        parser.getCurrentToken() == JSONToken.FIELD_NAME &&
        parser.getText() == 'formatted'
      ) {
        parser.nextToken();
        formattedAddress = parser.getText();
      }
    }
    return formattedAddress;
  }
}
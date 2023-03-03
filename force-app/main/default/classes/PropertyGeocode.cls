public with sharing class PropertyGeocode {
	private static Boolean geocodingCalled = false;
    
    // FROM PROPERTY ID   
	public static void DoAddressGeocode(id propertyId) {
        if(geocodingCalled || System.isFuture()) {
    		System.debug(LoggingLevel.WARN,'***Address Geocoding Future Method Already Called - Aborting...');
    		return;
        }
		
        geocodingCalled = true;
		geocodeAddress(propertyId);
	}
 
    // Given a property Id, geocode the property based on its address fields
	@future (callout=true)
	static private void geocodeAddress(Id propertyId){ 
  		// Key for Google Maps Geocoding API
  		String geocodingKey = 'AIzaSyDnGBdEG1XOodEdlPwRnqaFA5PRG2xnbFc';
  		// get the passed in address
  		Property__c geoProperty = [SELECT Billing_Street__c, Billing_City__c, Billing_State__c, Billing_Country__c, Billing_Postal_Code__c FROM Property__c WHERE id = :propertyId];
    
  		// check that we have enough information to geocode the address
		if((geoProperty.Billing_Street__c == null) || (geoProperty.Billing_City__c == null)) {
    		System.debug(LoggingLevel.WARN, 'Insufficient Data to Geocode Address');
    		return;
  		}
  		// create a string for the address to pass to Google Geocoding API
  		String geoAddress = '';
        if(geoProperty.Billing_Street__c != null){
            geoAddress += geoProperty.Billing_Street__c + ', ';
        }
        if(geoProperty.Billing_City__c != null){
    		geoAddress += geoProperty.Billing_City__c + ', ';
        }
        if(geoProperty.Billing_State__c != null){
    		geoAddress += geoProperty.Billing_State__c + ', ';
        }
        if(geoProperty.Billing_Country__c != null){
    		geoAddress += geoProperty.Billing_Country__c + ', ';
        }
        if(geoProperty.Billing_Postal_Code__c != null){
    		geoAddress += geoProperty.Billing_Postal_Code__c;
        }
  
  		// encode the string so we can pass it as part of URL
  		geoAddress = EncodingUtil.urlEncode(geoAddress, 'UTF-8');
  		// build and make the callout to the Geocoding API
  		Http http = new Http();
  		HttpRequest request = new HttpRequest();
  		request.setEndpoint('https://maps.googleapis.com/maps/api/geocode/json?address=' + geoAddress + '&key=' + geocodingKey + '&sensor=false');
  		request.setMethod('GET');
  		request.setTimeout(60000);
  		try {
    		// make the http callout
    		HttpResponse response = http.send(request);
    		// parse JSON to extract co-ordinates
    		JSONParser responseParser = JSON.createParser(response.getBody());
    		// initialize co-ordinates
    		double latitude = null;
    		double longitude = null;
            // parse Json to find the latitude and longitude
    		while(responseParser.nextToken() != null) {
      			if((responseParser.getCurrentToken() == JSONToken.FIELD_NAME) && (responseParser.getText() == 'location')) {
        			responseParser.nextToken();
        			while(responseParser.nextToken() != JSONToken.END_OBJECT) {         
						String locationText = responseParser.getText();
						responseParser.nextToken();
                        if (locationText == 'lat'){
           					latitude = responseParser.getDoubleValue();
                        } else if (locationText == 'lng'){
           					longitude = responseParser.getDoubleValue();
                        }
        			}
      			}
    		}
    		// update co-ordinates on address if we get them back
    		if(latitude != null) {
                // In edge case of lat or lon values going over field limits, truncate to 7 decimal places -- should prevent any errors from surfacing
                Decimal latRounded = Decimal.valueOf(latitude).setScale(7);
                Decimal lonRounded = Decimal.valueOf(longitude).setScale(7);
                
      			geoProperty.Geolocation__Latitude__s = latRounded;
      			geoProperty.Geolocation__Longitude__s = lonRounded;
      			update geoProperty;
    		}
  		} catch (Exception e) {
    		System.debug(LoggingLevel.ERROR, 'Error Geocoding Address - ' + e.getMessage());
  		}
	}

    // Below is a similar function, but parameters are address strings instead of Id. Used specifically for the distance filter to store address information & geolocate it
    // (It has recently been reworked to no longer store in separate Address record, instead returning the lat & lon to the LWC)
    
    @AuraEnabled(cacheable = true)
    public static Map<String, Decimal> geocodeAddressForDistance(String iStreet, String iCity, String iState, String iPostalCode) {
        // Key for Google Maps Geocoding API
  		String geocodingKey = 'AIzaSyDnGBdEG1XOodEdlPwRnqaFA5PRG2xnbFc';
        
        // Determine return values (lat & lon if successful, or if not, an effectively null lat & lon)
        Map<String, Decimal> latLon = new Map<String, Decimal>();
        Map<String, Decimal> nullReturn = new Map<String, Decimal>();
        nullReturn.put('lat', 0.0);
        nullReturn.put('lon', 0.0);
    
  		// check that we have enough information to geocode the address
		if((iStreet == null) || (iCity == null)) {
    		System.debug(LoggingLevel.WARN, 'Insufficient Data to Geocode Address');
    		return nullReturn;
  		}
  		// create a string for the address to pass to Google Geocoding API
  		String geoAddress = '';
        if(iStreet != null){
            geoAddress += iStreet + ', ';
        }
        if(iCity != null){
    		geoAddress += iCity + ', ';
        }
        if(iState != null){
    		geoAddress += iState + ', ';
        }
        geoAddress += 'United States of America, ';
        if(iPostalCode != null){
    		geoAddress += iPostalCode;
        }
  
  		// encode the string so we can pass it as part of URL
  		geoAddress = EncodingUtil.urlEncode(geoAddress, 'UTF-8');
  		// build and make the callout to the Geocoding API
  		Http http = new Http();
  		HttpRequest request = new HttpRequest();
  		request.setEndpoint('https://maps.googleapis.com/maps/api/geocode/json?address=' + geoAddress + '&key=' + geocodingKey + '&sensor=false');
  		request.setMethod('GET');
  		request.setTimeout(60000);
  		try {
    		// make the http callout
    		HttpResponse response = http.send(request);
    		// parse JSON to extract co-ordinates
    		JSONParser responseParser = JSON.createParser(response.getBody());
    		// initialize co-ordinates
    		double latitude = null;
    		double longitude = null;
            // parse Json to find the latitude and longitude
    		while(responseParser.nextToken() != null) {
      			if((responseParser.getCurrentToken() == JSONToken.FIELD_NAME) && (responseParser.getText() == 'location')) {
        			responseParser.nextToken();
        			while(responseParser.nextToken() != JSONToken.END_OBJECT) {         
						String locationText = responseParser.getText();
						responseParser.nextToken();
                        if (locationText == 'lat'){
           					latitude = responseParser.getDoubleValue();
                        } else if (locationText == 'lng'){
           					longitude = responseParser.getDoubleValue();
                        }
        			}
      			}
    		}
    		// update co-ordinates on address if we get them back
    		if(latitude != null) {
                Decimal latRounded = Decimal.valueOf(latitude).setScale(7);
                Decimal lonRounded = Decimal.valueOf(longitude).setScale(7);
                
				System.debug('HELLO: ' + latRounded + lonRounded);
                
      			latLon.put('lat', latRounded);
        		latLon.put('lon', lonRounded);
                return latLon;
            } else {
                return nullReturn;
            }
  		} catch (Exception e) {
    		System.debug(LoggingLevel.ERROR, 'Error Geocoding Address - ' + e.getMessage());
            return nullReturn;
  		}
    }
}
public with sharing class FindPlaces {
    private static Boolean apiCalled = false;
   
    // Given type of place, and lat & lon of property, find nearby places
    @AuraEnabled(cacheable = true)
    public static void apiGetPlaces(String type, Decimal lat, Decimal lon) {
        if (apiCalled || System.isFuture()) {
            System.debug(LoggingLevel.WARN,'***Places API Future Method Already Called - Aborting...');
    		return;
        }
        
        apiCalled = true;
        getPlaces(type, lat, lon);
	}
    
    // Get nearby places
    // @future(callout = true)
    @AuraEnabled(cacheable = true)
    public static List<Map<String, String>> getPlaces(String type, Decimal lat, Decimal lon) {
        
        // API - 500 MONTHLY LIMIT
        String apiKey = 'AIzaSyDnGBdEG1XOodEdlPwRnqaFA5PRG2xnbFc';
        Http http = new Http();
  		HttpRequest request = new HttpRequest();
  		// Set up request for API for nearby places
        String endpoint = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + lat + ',' + lon + '&radius=16094&type=' + type + '&language=en&key=' + apiKey;
        System.debug(endpoint);
  		request.setEndpoint(endpoint);
        request.setMethod('GET');
        
        // Attempt to send request
        try {
            // API request
            HttpResponse response = http.send(request);
            // System.debug(response.getBody());
            FindPlacesJson jsonApex = FindPlacesJson.parse(response.getBody());
            
            
            // List of results
            List<Map<String, String>> results = new List<Map<String, String>>();
            
            for (FindPlacesJson.Results res : jsonApex.Results) {
                // Parse JSON results into map
                Map<String, String> thisResult = new Map<String, String>();
                thisResult.put('name', res.name);
                thisResult.put('address', res.vicinity);
                if (res.rating != null) {
                    thisResult.put('rating', 'Rating: ' + String.valueOf(res.rating) + '/5, from ' + String.valueOf(res.user_ratings_total) + ' users.');
                    thisResult.put('ratingNum', String.valueOf(res.rating));
                } else {
                    thisResult.put('rating', 'No ratings found');
                    thisResult.put('ratingNum', '0');
                }
                thisResult.put('latitude', String.valueOf(res.geometry.location.lat));
                thisResult.put('longitude', String.valueOf(res.geometry.location.lng));
                thisResult.put('placeId', res.place_id);
                thisResult.put('url', 'https://www.google.com/maps/place/?q=place_id:' + res.place_id);
                thisResult.put('viewportNElat', String.valueOf(res.geometry.viewport.northeast.lat));
                thisResult.put('viewportNElon', String.valueOf(res.geometry.viewport.northeast.lng));
                thisResult.put('viewportSWlat', String.valueOf(res.geometry.viewport.southwest.lat));
                thisResult.put('viewportSWlon', String.valueOf(res.geometry.viewport.southwest.lng));
                
                // Calculate Haversine distance
                Double radius = 6371.00;
                Double dLat = (res.geometry.location.lat - lat) * 3.1415926 / 180;
                Double dLon = (res.geometry.location.lng - lon) * 3.1415926 / 180;
                Double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
                    	   Math.cos(lat * 3.1415926 / 180) * 
                    	   Math.cos(res.geometry.location.lat * 3.1415926 / 180) * 
                    	   Math.sin(dLon / 2) * Math.sin(dLon / 2);
                Double c = 2 * Math.asin(Math.sqrt(a));
                
                Double kmToMiles = 0.621371;
                Double distance = radius * c * kmToMiles;
                thisResult.put('distance', String.valueOf(distance));
                
                // Store in list
                results.add(thisResult);
            }
            
            System.debug('SIZE: ' + results.size());
            System.debug('RES: ' + results[0]);
            
            return results;
            
        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Error - ' + e.getMessage());
            
            return null;
		}
    }
}
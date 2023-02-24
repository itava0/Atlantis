public with sharing class FindNearbySchools {
	// NOTE: This whole class has been deprecated by the Modal Map component and classes, but I'm keeping it
	// up as a reference for API queries and storing that information
	
    private static Boolean apiCalled = false;

	/* DEPRECATED    
    @AuraEnabled(cacheable = true)
    public static void apiGetSchools(String postalCode) {
        if (apiCalled || System.isFuture()) {
            System.debug(LoggingLevel.WARN,'***Property API Future Method Already Called - Aborting...');
    		return;
        }
        
        apiCalled = true;
        getSchools(postalCode);
	} */
    
    // Get schools from a property
    @AuraEnabled (cacheable = true)
    public static List<School__c> apiGetSchools(Id propId) {
		return [SELECT Id, Name, Type__c, Maps_URL__c, Rating__c, Property__c FROM School__c WHERE Property__c =: propId ORDER BY Rating__c DESC NULLS LAST];
    }
    
    // Get schools by calling API
    @future(callout = true)
    public static void getSchools(String postalCode) {
        
        // API - 300 MONTHLY LIMIT
        String apiKey = '5d822e3d74mshc13b62e215c4196p1f2efajsn63c0d2f92500';
        Http http = new Http();
  		HttpRequest request = new HttpRequest();
  		// Set up request for API for nearby schools given postal code
        request.setEndpoint('https://us-real-estate.p.rapidapi.com/location/schools?postal_code=' + postalCode);
  		request.setMethod('GET');
        request.setHeader('Content-Type', 'Application/Json');
        request.setHeader('X-RapidAPI-Key', apiKey);
        request.setHeader('X-RapidAPI-Host', 'us-real-estate.p.rapidapi.com');
  		// request.setTimeout(60000);
        
        // Attempt to send request
        try {
            // API request
            HttpResponse response = http.send(request);
            
            // Alternatively, test responses to avoid using up limited API calls while testing
            // 02215
            String testResponse = '{'+
		'    "status": 200,'+
		'    "data": {'+
		'        "private": {'+
		'            "schools": ['+
		'                {'+
		'                    "rating": null,'+
		'                    "slug_id": "Winsor-School-0735745321",'+
		'                    "id": "0735745321",'+
		'                    "name": "Winsor School",'+
		'                    "location": {'+
		'                        "city_slug_id": "Boston_MA",'+
		'                        "city": "Boston",'+
		'                        "state": "MA"'+
		'                    }'+
		'                },'+
		'                {'+
		'                    "rating": null,'+
		'                    "slug_id": "Boston-University-Academy-0735757631",'+
		'                    "id": "0735757631",'+
		'                    "name": "Boston University Academy",'+
		'                    "location": {'+
		'                        "city_slug_id": "Boston_MA",'+
		'                        "city": "Boston",'+
		'                        "state": "MA"'+
		'                    }'+
		'                }'+
		'            ],'+
		'            "total": 2'+
		'        },'+
		'        "university": ['+
		'            {'+
		'                "city": "Boston",'+
		'                "lid": "00000001104470058838",'+
		'                "state_code": "MA",'+
		'                "name": "Boston Conservatory",'+
		'                "city_slug_id": "Boston_MA",'+
		'                "slug_id": "Boston-Conservatory-00000001104470058838"'+
		'            },'+
		'            {'+
		'                "city": "Boston",'+
		'                "lid": "00000001104470083574",'+
		'                "state_code": "MA",'+
		'                "name": "Emmanuel College",'+
		'                "city_slug_id": "Boston_MA",'+
		'                "slug_id": "Emmanuel-College-00000001104470083574"'+
		'            },'+
		'            {'+
		'                "city": "Boston",'+
		'                "lid": "00000001104470288576",'+
		'                "state_code": "MA",'+
		'                "name": "Wheelock College",'+
		'                "city_slug_id": "Boston_MA",'+
		'                "slug_id": "Wheelock-College-00000001104470288576"'+
		'            },'+
		'            {'+
		'                "city": "Boston",'+
		'                "lid": "00000001104470414880",'+
		'                "state_code": "MA",'+
		'                "name": "Boston University",'+
		'                "city_slug_id": "Boston_MA",'+
		'                "slug_id": "Boston-University-00000001104470414880"'+
		'            }'+
		'        ],'+
		'        "elementary": {'+
		'            "schools": ['+
		'                {'+
		'                    "rating": 5,'+
		'                    "slug_id": "Match-Charter-Public-School-0735751561",'+
		'                    "id": "0735751561",'+
		'                    "name": "Match Charter Public School",'+
		'                    "location": {'+
		'                        "city_slug_id": "Boston_MA",'+
		'                        "city": "Boston",'+
		'                        "state": "MA"'+
		'                    }'+
		'                }'+
		'            ],'+
		'            "total": 1'+
		'        },'+
		'        "middle": {'+
		'            "schools": ['+
		'                {'+
		'                    "rating": 5,'+
		'                    "slug_id": "Match-Charter-Public-School-0735751561",'+
		'                    "id": "0735751561",'+
		'                    "name": "Match Charter Public School",'+
		'                    "location": {'+
		'                        "city_slug_id": "Boston_MA",'+
		'                        "city": "Boston",'+
		'                        "state": "MA"'+
		'                    }'+
		'                }'+
		'            ],'+
		'            "total": 1'+
		'        },'+
		'        "high": {'+
		'            "schools": ['+
		'                {'+
		'                    "rating": 5,'+
		'                    "slug_id": "Match-Charter-Public-School-0735751561",'+
		'                    "id": "0735751561",'+
		'                    "name": "Match Charter Public School",'+
		'                    "location": {'+
		'                        "city_slug_id": "Boston_MA",'+
		'                        "city": "Boston",'+
		'                        "state": "MA"'+
		'                    }'+
		'                }'+
		'            ],'+
		'            "total": 1'+
		'        }'+
		'    }'+
		'}';
        
            // REAL API RESPONSE
        	System.debug(response.getBody());
            FindSchoolsJson jsonApex = FindSchoolsJson.parse(response.getBody());
            
            // TEST RESPONSE
            // System.debug(testResponse);
        	// FindSchoolsJson jsonApex = FindSchoolsJson.parse(testResponse);
         
			// List of all schools
            List<Map<String, String>> allSchools = new List<Map<String, String>>();
            List<School__c> schToAdd = new List<School__c>();
            
            // Check if matching properties don't already have schools
            String pcStr = String.valueOf(postalCode);
            List<Property__c> propList = [SELECT Id FROM Property__c WHERE Billing_Postal_Code__c =: pcStr];
            Set<Id> propIds = new Set<Id>();
            for (Property__c prop : propList) {
                propIds.add(prop.Id);
            }
            List<School__c> schList = [SELECT Property__c FROM School__c WHERE Property__c IN: propIds];
            
            // Universities
            List<Map<String, String>> universities = new List<Map<String, String>>();
            for (FindSchoolsJson.University sch : jsonApex.data.university) {
                // Add school information (deprecated)
                Map<String, String> thisUniversity = new Map<String, String>();
                thisUniversity.put('name', sch.name);
                thisUniversity.put('city', sch.city);
                thisUniversity.put('state', sch.state_code);
                thisUniversity.put('lid', sch.lid);
                thisUniversity.put('slug_id', sch.slug_id);
                thisUniversity.put('type', 'University');
                
                // Add formatted URL for Google Maps
                String schoolUrl = sch.name + ', ' + sch.city + ', ' + sch.state_code + ', ' + postalCode;
                schoolUrl = EncodingUtil.urlEncode(schoolUrl, 'UTF-8');
                thisUniversity.put('maps_url', 'https://maps.google.com/maps?q=' + schoolUrl);
                
                
                
                // Store in school record
                
                if (schList.size() == 0) {
                    for (Property__c prop : propList) {
                        School__c schl = new School__c(Name = sch.name, City__c = sch.city, State__c = sch.state_code,
                                                   Postal_Code__c = Integer.valueOf(postalCode), Type__c = 'University', Property__c = prop.Id,
                                                   Maps_URL__c = 'https://maps.google.com/maps?q=' + schoolUrl);
                    	schToAdd.add(schl);
					}
                }
                
                // Add to lists (deprecated)
                universities.add(thisUniversity);
                allSchools.add(thisUniversity);
			}
            
            // Private Schools
            List<Map<String, String>> privates = new List<Map<String, String>>();
            for (FindSchoolsJson.Schools sch : jsonApex.data.private_z.schools) {
                // Add school information (deprecated)
                Map<String, String> thisPrivate = new Map<String, String>();
                thisPrivate.put('name', sch.name);
                thisPrivate.put('id', String.valueOf(sch.id));
                thisPrivate.put('rating', String.valueOf(sch.rating));
                thisPrivate.put('city', sch.location.city);
                thisPrivate.put('state', sch.location.state);
                thisPrivate.put('slug_id', sch.slug_id);
                thisPrivate.put('type', 'Private School');
                
                // Add formatted URL for Google Maps
                String schoolUrl = sch.name + ', ' + sch.location.city + ', ' + sch.location.state + ', ' + postalCode;
                schoolUrl = EncodingUtil.urlEncode(schoolUrl, 'UTF-8');
                thisPrivate.put('maps_url', 'https://maps.google.com/maps?q=' + schoolUrl);
                
                // Store in school record
                if (schList.size() == 0) {
                    for (Property__c prop : propList) {
                        School__c schl = new School__c(Name = sch.name, City__c = sch.location.city, State__c = sch.location.state,
                                                       Postal_Code__c = Integer.valueOf(postalCode), Type__c = 'Private School', Property__c = prop.Id,
                                                       Rating__c = sch.rating, Maps_URL__c = 'https://maps.google.com/maps?q=' + schoolUrl);
                        schToAdd.add(schl);
                    }
                }
                
                // Add to lists (deprecated)
                privates.add(thisPrivate);
                allSchools.add(thisPrivate);
            }
            
            // High Schools
            List<Map<String, String>> highs = new List<Map<String, String>>();
            for (FindSchoolsJson.Schools_z sch : jsonApex.data.high.schools) {
                // Add school information (deprecated)
                Map<String, String> thisHigh = new Map<String, String>();
                thisHigh.put('name', sch.name);
                thisHigh.put('id', String.valueOf(sch.id));
                thisHigh.put('rating', String.valueOf(sch.rating));
                thisHigh.put('city', sch.location.city);
                thisHigh.put('state', sch.location.state);
                thisHigh.put('slug_id', sch.slug_id);
                thisHigh.put('type', 'High School');
                
                // Add formatted URL for Google Maps
                String schoolUrl = sch.name + ', ' + sch.location.city + ', ' + sch.location.state + ', ' + postalCode;
                schoolUrl = EncodingUtil.urlEncode(schoolUrl, 'UTF-8');
                thisHigh.put('maps_url', 'https://maps.google.com/maps?q=' + schoolUrl);
                
                // Store in school record
                if (schList.size() == 0) {
                    for (Property__c prop : propList) {
                        School__c schl = new School__c(Name = sch.name, City__c = sch.location.city, State__c = sch.location.state,
                                                   Postal_Code__c = Integer.valueOf(postalCode), Type__c = 'High School', Property__c = prop.Id,
                                                   Rating__c = sch.rating, Maps_URL__c = 'https://maps.google.com/maps?q=' + schoolUrl);
                    	schToAdd.add(schl);
					}
                }
                
                // Add to lists (deprecated)
                highs.add(thisHigh);
                allSchools.add(thisHigh);
            }
            
            // Middle Schools
            List<Map<String, String>> middles = new List<Map<String, String>>();
            for (FindSchoolsJson.Schools_z sch : jsonApex.data.middle.schools) {
                // Add school information (deprecated)
                Map<String, String> thisMiddle = new Map<String, String>();
                thisMiddle.put('name', sch.name);
                thisMiddle.put('id', String.valueOf(sch.id));
                thisMiddle.put('rating', String.valueOf(sch.rating));
                thisMiddle.put('city', sch.location.city);
                thisMiddle.put('state', sch.location.state);
                thisMiddle.put('slug_id', sch.slug_id);
                thisMiddle.put('type', 'Middle School');
                
                // Add formatted URL for Google Maps
                String schoolUrl = sch.name + ', ' + sch.location.city + ', ' + sch.location.state + ', ' + postalCode;
                schoolUrl = EncodingUtil.urlEncode(schoolUrl, 'UTF-8');
                thisMiddle.put('maps_url', 'https://maps.google.com/maps?q=' + schoolUrl);
                
                // Store in school record
                if (schList.size() == 0) {
                    for (Property__c prop : propList) {
                        School__c schl = new School__c(Name = sch.name, City__c = sch.location.city, State__c = sch.location.state,
                                                       Postal_Code__c = Integer.valueOf(postalCode), Type__c = 'Middle School', Property__c = prop.Id,
                                                       Rating__c = sch.rating, Maps_URL__c = 'https://maps.google.com/maps?q=' + schoolUrl);
                        schToAdd.add(schl);
					}
				}
                
                // Add to lists (deprecated)
                middles.add(thisMiddle);
                allSchools.add(thisMiddle);
            }
            
            // Elementary Schools
            List<Map<String, String>> elementaries = new List<Map<String, String>>();
            for (FindSchoolsJson.Schools_z sch : jsonApex.data.elementary.schools) {
                // Add school information (deprecated)
                Map<String, String> thisElementary = new Map<String, String>();
                thisElementary.put('name', sch.name);
                thisElementary.put('id', String.valueOf(sch.id));
                thisElementary.put('rating', String.valueOf(sch.rating));
                thisElementary.put('city', sch.location.city);
                thisElementary.put('state', sch.location.state);
                thisElementary.put('type', 'Elementary School');
                
                // Add formatted URL for Google Maps
                String schoolUrl = sch.name + ', ' + sch.location.city + ', ' + sch.location.state + ', ' + postalCode;
                schoolUrl = EncodingUtil.urlEncode(schoolUrl, 'UTF-8');
                thisElementary.put('maps_url', 'https://maps.google.com/maps?q=' + schoolUrl);
                
                // Store in school record
                if (schList.size() == 0) {
                    for (Property__c prop : propList) {
                        School__c schl = new School__c(Name = sch.name, City__c = sch.location.city, State__c = sch.location.state,
                                                   Postal_Code__c = Integer.valueOf(postalCode), Type__c = 'Elementary School', Property__c = prop.Id,
                                                   Rating__c = sch.rating, Maps_URL__c = 'https://maps.google.com/maps?q=' + schoolUrl);
                    	schToAdd.add(schl);
					}
				}
                
                // Add to lists (deprecated)
                elementaries.add(thisElementary);
                allSchools.add(thisElementary);
            }
            
            System.debug('SIZES:: UNI: ' + jsonApex.data.university.size() + ', ELE: ' + jsonApex.data.elementary.schools.size() + ', MID: ' +
                        jsonApex.data.middle.schools.size() + ', HGH: ' + jsonApex.data.high.schools.size() + ', PRV: ' + jsonApex.data.private_z.schools.size() +
                        ', ALL: ' + allSchools.size());
            
            insert schToAdd;

        } catch (Exception e) {
            System.debug(LoggingLevel.ERROR, 'Error - ' + e.getMessage());
            
		}
	}
}
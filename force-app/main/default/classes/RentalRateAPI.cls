public with sharing class RentalRateAPI {
  static String token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjRjNTVkYjUzYmIyOTc0YmZkYzU3YzFkMmUyYjk5NWNkYWM5NzNjNzNlZjRhNDljNzMzZWY0MDc0NGFhM2VlYTgwZjI2ZWI4YWM5YmI2NTA0In0.eyJhdWQiOiI2IiwianRpIjoiNGM1NWRiNTNiYjI5NzRiZmRjNTdjMWQyZTJiOTk1Y2RhYzk3M2M3M2VmNGE0OWM3MzNlZjQwNzQ0YWEzZWVhODBmMjZlYjhhYzliYjY1MDQiLCJpYXQiOjE2Nzk5NDMyMzYsIm5iZiI6MTY3OTk0MzIzNiwiZXhwIjoxOTk1NTYyNDM2LCJzdWIiOiI0ODcwNSIsInNjb3BlcyI6W119.OLvnu0tK-gzfQhwX5-2kUYFpl4637A5eIaHJdEnlnyKQCQp0Nbb0fWxiPkDm2_neOd6Znlf58i74AAk4vYMX7g';
    private static final Map<String, String> americanAbbrToFull = new Map<String, String>{
      'AK' => 'Alaska',
      'AL' => 'Alabama',
      'AZ' => 'Arizona',
      'AR' => 'Arkansas',
      'CA' => 'California',
      'CO' => 'Colorado',
      'CT' => 'Connecticut',
      'DE' => 'Delaware',
      'DC' => 'District of Columbia',
      'FL' => 'Florida',
      'GA' => 'Georgia',
      'HI' => 'Hawaii',
      'ID' => 'Idaho',
      'IL' => 'Illinois',
      'IN' => 'Indiana',
      'IA' => 'Iowa',
      'KS' => 'Kansas',
      'KY' => 'Kentucky',
      'LA' => 'Louisiana',
      'ME' => 'Maine',
      'MD' => 'Maryland',
      'MA' => 'Massachusetts',
      'MI' => 'Michigan',
      'MN' => 'Minnesota',
      'MS' => 'Mississippi',
      'MO' => 'Missouri',
      'MT' => 'Montana',
      'NE' => 'Nebraska',
      'NV' => 'Nevada',
      'NH' => 'New Hampshire',
      'NJ' => 'New Jersey',
      'NM' => 'New Mexico',
      'NY' => 'New York',
      'NC' => 'North Carolina',
      'ND' => 'North Dakota',
      'OH' => 'Ohio',
      'OK' => 'Oklahoma',
      'OR' => 'Oregon',
      'PA' => 'Pennsylvania',
      'PR' => 'Puerto Rico',
      'RI' => 'Rhode Island',
      'SC' => 'South Carolina',
      'SD' => 'South Dakota',
      'TN' => 'Tennessee',
      'TX' => 'Texas',
      'VI' => 'U.S. Virgin Islands',
      'UT' => 'Utah',
      'VT' => 'Vermont',
      'VA' => 'Virginia',
      'WA' => 'Washington',
      'WV' => 'West Virginia',
      'WI' => 'Wisconsin',
      'WY' => 'Wyoming'
    };

  @AuraEnabled(Cacheable=true)
  public static String RentalRateAPI(Id propertyId) {
    Property__c[] billingState = [
      SELECT Billing_State__c
      FROM Property__c
      WHERE id = :propertyId
    ];

    String state = String.valueOf(billingState[0].get('Billing_State__c'));
    String stateCode = null;

    for (String key : americanAbbrToFull.keySet()) {
      if (americanAbbrToFull.get(key).equals(state)) {
        stateCode = key;
        break; // Exit the loop once a match is found
      }
    }

    // Instantiate a new Http object
    Http h = new Http();

    // Instantiate a new HTTP request
    // Specify request properties such as the endpoint, the POST method, etc.
    HttpRequest req = new HttpRequest();
    req.setEndpoint(
      'https://www.huduser.gov/hudapi/public/fmr/statedata/' + stateCode + ''
    );
    req.setMethod('GET');
    req.setHeader('Content-Type', 'application/json');
    req.setHeader('Accept', 'application/json');
    req.setHeader('Authorization', 'Bearer ' + token);
    // Send the request, and return a response
    HttpResponse res = h.send(req);
    return res.getBody();
  }
}

public with sharing class ProspectiveTenant {

    @AuraEnabled(Cacheable=false)
    public static void insertTenant(
        String name, String property, Integer SSN, 
        String phone, String email, Date DOB, 
        String DL, Integer leaseTerm, Date moveInDate, 
        Integer creditScore, Decimal monthlyIncome, String veteran, Decimal rent ) {

        Opportunity opp = new Opportunity(
            Name = name,
            StageName = 'Prospecting',
            CloseDate = date.today(),
            Type = 'New customer',
            LeadSource = 'Web',
            Property__c = property,
            Social_Security__c = SSN,
            Phone__c = phone,
            email__c = email,
            DOB__c = DOB,
            Driver_License__c = DL,
            Lease_Term_Months__c = leaseTerm,
            Lease_Start_Date__c = moveInDate,
            Credit_Score__c = creditScore,
            Monthly_Income__c = monthlyIncome,
            veteran__c = veteran,
            Rent_Amount__c = rent
        );

        insert opp;
    }

    @AuraEnabled(Cacheable=false)
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
    req.setBody('{"username": "itavare01@gmail.com","password": "199526Carlos@1","client_id": "AownthkGS3tfNh7GzKdZUdF2GyO3kcGG","client_secret": "cTGcFT9TlsQkjg78"}');

    // Send the request, and return a response
    HttpResponse res = h.send(req);
    Map<String, Object> query = (Map<String, Object>)JSON.deserializeUntyped(res.getBody());
    //Get the key and return a value
     return query.get('access_token');
}

  // Pass in the Authorization Header to be used using the Object token
  @AuraEnabled(Cacheable=false)
  public static String getCreditScore(Object token) {

    // Instantiate a new Http object
    Http h = new Http();

    // Instantiate a new HTTP request
    // Specify request properties such as the endpoint, the POST method, etc. 
    HttpRequest req = new HttpRequest();
    req.setEndpoint('https://sandbox-us-api.experian.com/consumerservices/credit-profile/v1/advanced-instant-credit');
    req.setMethod('POST');
    req.setHeader('Content-Type', 'application/json');
    req.setHeader('Accept', 'application/json');
    req.setHeader('Authorization', 'Bearer '+token);
    req.setHeader('clientReferenceId', 'SBMYSQL');
    req.setBody('{"consumerPii": {"primaryApplicant": {"name": {"lastName": "ARMSTRONG","firstName": "KARL","middleName": "E"},"dob": {"dob": "1959"},"ssn": {"ssn": "111111111"},"currentAddress": {"line1": "1073 BUCKINGHAM DR","city": "CAROL STREAM","state": "IL","zipCode": "60188"}},"secondaryApplicant": {"name": {"lastName": "REYNOLDS","firstName": "ROBERTS"},"dob": {"dob": "10041962"},"ssn": {"ssn": "333333333"},"driverslicense": {"number": "A00000000000","state": "CT"},"employment": {"employerName": "HOMELAND SECURITY"}}},"requestor": {"subscriberCode": "2222222"},"permissiblePurpose": {"type": "3F","terms": "","abbreviatedAmount": ""},"resellerInfo": {"endUserName": "CPAPIV2TC24"},    "freezeOverride": {"primaryApplFreezeOverrideCode": "000002522653451","secondaryApplFreezeOverrideCode": "000002909814012"},"addOns":{"directCheck": "Y","demographics": "Geocode and Phone","liftPremium": "Y","clarityData": {"clarityAccountId": "0000000","clarityLocationId": "000000","clarityControlFileName": "test_file","clarityControlFileVersion": "0000000"},"summaries": {"summaryType": ["Profile Summary"]},"mla": "Y","ofacmsg": "Y","consumerIdentCheck": {"getUniqueConsumerIdentifier": "Y"},"joint": "Y","sureProfile": "Y","ssnIndicators": "Y","newConsumer": "Y"},"customOptions": {"optionId": ["COADEX"]},"solutionId": "63DXP1","daasReferenceId": "GOOGLEIC","infoId1": { "item": ["Credit Card/PreApproved/ContCtr/5/1X11/0000000100.00/0000000020.00/0000000000.00"]}}');

    // Send the request, and return a response
    HttpResponse res = h.send(req);
    return res.getBody();
  }
    
}
public without sharing class StripeHandler {

    private static final String STRIPE_SECRET_KEY = 'sk_test_51M3tY3D15KhrjJEhmAhl0nLQeJlPyE0H9aDL9m2QCkELmGI81wz4EZVEA79UhVcs4rdYJICE9PiIb68sSMskxPgw00Tcn94Aib';

    //Query the account ID
    @AuraEnabled(Cacheable=true)
    public static string getAccId(Id contactId){
        Contact con = [SELECT Id, AccountId FROM Contact WHERE Id = :contactId];
        Id accountId = con.AccountId;
        Account acc = [SELECT Id FROM Account WHERE Id = :accountId];
        return acc.Id;
    }

    //Create customer on Stripe and generate customerId
    @AuraEnabled(Cacheable=false)
    public static String createCustomer(Id accountId) {
        // Set up the HTTP request
        Account acc = [SELECT Id, CustomerId__c FROM Account WHERE Id = :accountId];
        Contact con = [SELECT Id, Name, Email FROM Contact WHERE AccountId =: acc.Id];
        String name = con.Name;
        String email = con.Email;
        if(acc.customerId__c == null) {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://api.stripe.com/v1/customers');
            request.setMethod('POST');
            request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
            request.setHeader('Authorization', 'Bearer ' + STRIPE_SECRET_KEY);

            // Set the request body
            String body = 'name=' + name + '&email=' + email;
            request.setBody(body);

            // Send the HTTP request and handle the response

            HttpResponse response = http.send(request);
            if (response.getStatusCode() == 200) {
                // Success - parse the response data
                Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                String customerId = (String) data.get('id');
                system.debug(customerId);
                acc.customerId__c = customerId;
                update acc;
                return customerId;
            } else {
                // Handle error
                system.debug(response.getStatusCode());
            }
        }
        return acc.customerId__c;
    }

    //Grab information on customer using the customerId
    @AuraEnabled(Cacheable=true)
    public static string getCustomerInfo(String customerId){
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://api.stripe.com/v1/customers/'+customerId);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setHeader('Authorization', 'Bearer ' + STRIPE_SECRET_KEY);


        // Send the HTTP request and handle the response
        HttpResponse response = http.send(request);
        if (response.getStatusCode() == 200) {
            // Success - parse the response data
            Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            
            return String.valueOf(response.getBody());
        } else {
            return String.valueOf(response);
            // Handle error
        }
    }

    //Update the account record with the customerId
    @AuraEnabled(Cacheable=false)
    public static void updateCustomerId(Id accountId, String cusId) {
        Account acc = [SELECT Id, CustomerId__c FROM Account WHERE Id = :accountId];
        acc.CustomerId__c = cusId;
        update acc;
    }

    //Create a token for the payment method
    @AuraEnabled
    public static String createToken(Id accountId, String cardNumber, String expMonth, String expYear, String cvc) {
        // Set up the HTTP request
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://api.stripe.com/v1/tokens');
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setHeader('Authorization', 'Bearer ' + STRIPE_SECRET_KEY);

        // Set the request body
        String body = 'card[number]=' + cardNumber + '&card[exp_month]=' + expMonth + '&card[exp_year]=' + expYear + '&card[cvc]=' + cvc;
        request.setBody(body);

        // Send the HTTP request and handle the response

        HttpResponse response = http.send(request);
        if (response.getStatusCode() == 200) {
            // Success - parse the response data
            Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            // returnn token Id
            String tokId = (String) data.get('id');
            return tokId;
        } else {
            // Handle error
        }
        return null;

    }

    //Make a payment using charge method
    @AuraEnabled
    public static String makePayment(String token, Decimal amount, String customerId) {
        // Set up the HTTP request
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://api.stripe.com/v1/charges');
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setHeader('Authorization', 'Bearer ' + STRIPE_SECRET_KEY);

        // Set the request body
        String body = 'amount=' + (amount*100).intValue() + '&currency=usd&source=' + token + '&customer=' + customerId;
        request.setBody(body);

        // Send the HTTP request and handle the response
        HttpResponse response = http.send(request);
        if (response.getStatusCode() == 200) {
            // Success - parse the response data
            Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            
            String chId = (String) data.get('id');
            return chId;
        } else {
            return String.valueOf(response);
            // Handle error
        }

    }

    //Convert token into a payment method and save to customer
    @AuraEnabled
    public static List<String> addCard(String customerId, String token){
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://api.stripe.com/v1/customers/'+customerId+'/sources');
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setHeader('Authorization', 'Bearer ' + STRIPE_SECRET_KEY);

        // Set the request body
        String body = 'source=' + token;
        request.setBody(body);

        // Send the HTTP request and handle the response
        HttpResponse response = http.send(request);
        List<String> returnList = new List<String>();
        returnList.add(String.valueOf(response.getStatusCode()));
        if (response.getStatusCode() == 200) {
            // Success - parse the response data
            Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            
            String cardId = (String) data.get('id');
            returnList.add(cardId);
        } else {
            returnList.add(String.valueOf(response.getBody()));
            // Handle error
        }
        return returnList;
    }

    //return a list of cards belonging to the customer
    @AuraEnabled
    public static string viewAllCards(String customerId){
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://api.stripe.com/v1/customers/'+customerId+'/sources?object=card');
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setHeader('Authorization', 'Bearer ' + STRIPE_SECRET_KEY);


        // Send the HTTP request and handle the response
        HttpResponse response = http.send(request);
        if (response.getStatusCode() == 200) {
            // Success - parse the response data
            Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            
            return String.valueOf(response.getBody());
        } else {
            return String.valueOf(response);
            // Handle error
        }
    }

    //return specific card
    @AuraEnabled
    public static string getCard(String customerId, String source){
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://api.stripe.com/v1/customers/'+customerId+'/sources/' + source);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setHeader('Authorization', 'Bearer ' + STRIPE_SECRET_KEY);


        // Send the HTTP request and handle the response
        HttpResponse response = http.send(request);
        if (response.getStatusCode() == 200) {
            // Success - parse the response data
            Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            
            return String.valueOf(response.getBody());
        } else {
            return String.valueOf(response);
            // Handle error
        }
    }

    //return charge object
    @AuraEnabled
    public static string getCharge(String charge){
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://api.stripe.com/v1/charges/'+charge);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setHeader('Authorization', 'Bearer ' + STRIPE_SECRET_KEY);


        // Send the HTTP request and handle the response
        HttpResponse response = http.send(request);
        if (response.getStatusCode() == 200) {
            // Success - parse the response data
            Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            
            return String.valueOf(response.getBody());
        } else {
            return String.valueOf(response);
            // Handle error
        }
    }

    //Return map of balance items, including discounts, for printing purposes
    @AuraEnabled(Cacheable=true)
    public static Map<String,Decimal> getLeasePricings(Id accountId) {
        //query leases
        List<Contract> contractList = [SELECT Id, AccountId, Property__r.Billing_Street__c, Monthly_Rent__c, StartDate, EndDate,
            Long_Term_Resident_Discount__c, Veteran_Discount__c, Senior_Discount__c, Deposit_Required__c,
            Renewal_Discount__c FROM Contract WHERE EndDate >= TODAY AND StartDate <= TODAY 
            AND status = 'activated' AND AccountId =: accountId];
        Map<String,Decimal> leasePricing = new Map<String,Decimal>();
        Decimal overall = 0;
        //add rent + discounts to map
        for(Contract con:contractList) {
            String itemName = con.Property__r.Billing_Street__c + ' - Rent';
            leasePricing.put(itemName, con.Monthly_Rent__c);
            overall += con.Monthly_Rent__c;
            Decimal curItemPrice = con.Monthly_Rent__c;
            if(con.Long_Term_Resident_Discount__c != NULL && con.Long_Term_Resident_Discount__c != 0) {
                Decimal discount = con.Long_Term_Resident_Discount__c * 0.01 * curItemPrice;
                leasePricing.put(con.Property__r.Billing_Street__c + ' - Long term resident discount', discount*-1);
                overall -= discount;
                curItemPrice -= discount;
            }
            if(con.Veteran_Discount__c != NULL && con.Veteran_Discount__c != 0){
                Decimal discount = con.Veteran_Discount__c * 0.01 * curItemPrice;
                leasePricing.put(con.Property__r.Billing_Street__c + ' - Veteran discount', discount*-1);
                overall -= discount;
                curItemPrice -= discount;
            }
            if(con.Senior_Discount__c != NULL && con.Senior_Discount__c != 0){
                Decimal discount = con.Senior_Discount__c * 0.01 * curItemPrice;
                leasePricing.put(con.Property__r.Billing_Street__c + ' - Elderly discount', discount*-1);
                overall -= discount;
                curItemPrice -= discount;
            }
            if(con.Renewal_Discount__c != NULL && con.Renewal_Discount__c != 0) {
                Decimal discount = con.Renewal_Discount__c * 0.01 * curItemPrice;
                leasePricing.put(con.Property__r.Billing_Street__c + ' - Renewal discount', discount*-1);
                overall -= discount;
                curItemPrice -= discount;
            }
            if(con.Deposit_Required__c && Date.Today().Month() == con.StartDate.Month() && Date.Today().Year() == con.StartDate.Year()) {
                String depositName = con.Property__r.Billing_Street__c + ' - Deposit';
                leasePricing.put(depositName, con.Monthly_Rent__c/2);
                overall += con.Monthly_Rent__c/2;
            }
        }
        leasePricing.put('Overall', overall);
        return leasePricing;
    }

    //Return map of balance items, including discounts, for invoice purposes
    @AuraEnabled(Cacheable=true)
    public static Map<String,Decimal> addLeasePricingsToInvoice(Id accountId, String customerId, String invoiceId) {
        //Query leases
        List<Contract> contractList = [SELECT Id, AccountId, Property__r.Billing_Street__c, Monthly_Rent__c, StartDate, EndDate,
            Long_Term_Resident_Discount__c, Veteran_Discount__c, Senior_Discount__c, Deposit_Required__c,
            Renewal_Discount__c FROM Contract WHERE EndDate >= TODAY AND StartDate <= TODAY 
            AND status = 'activated' AND AccountId =: accountId];
        Map<String,Decimal> leasePricing = new Map<String,Decimal>();
        Decimal overall = 0;
        //Add rent as invoice item + apply discounts
        for(Contract con:contractList) {
            String itemName = con.Property__r.Billing_Street__c + ' - Rent';
            leasePricing.put(itemName, con.Monthly_Rent__c);
            List<String> discounts = new List<String>();
            //Check if coupon is applicable. If so then add it
            if(con.Long_Term_Resident_Discount__c != NULL && con.Long_Term_Resident_Discount__c != 0) {
                discounts.add(createCoupon(con.Long_Term_Resident_Discount__c, 'Long term resident discount'));
            }
            if(con.Veteran_Discount__c != NULL && con.Veteran_Discount__c != 0) {
                discounts.add(createCoupon(con.Veteran_Discount__c, 'Veteran discount'));
            }
            if(con.Senior_Discount__c != NULL && con.Senior_Discount__c != 0) {
                discounts.add(createCoupon(con.Senior_Discount__c, 'Eldery discount'));
            }
            if(con.Renewal_Discount__c != NULL && con.Renewal_Discount__c != 0) {
                discounts.add(createCoupon(con.Renewal_Discount__c, 'Renewal discount'));
            }
            String invoiceItemId = createInvoiceItem(customerId, con.Monthly_Rent__c, itemName, invoiceId, discounts);
            overall += con.Monthly_Rent__c;
            //Check if deposit is required. If so then add it
            if(con.Deposit_Required__c && Date.Today().Month() == con.StartDate.Month() && Date.Today().Year() == con.StartDate.Year()) {
                String depositName = con.Property__r.Billing_Street__c + ' - Deposit';
                leasePricing.put(depositName, con.Monthly_Rent__c/2);
                createInvoiceItem(customerId, con.Monthly_Rent__c/2, depositName, invoiceId, new List<String>());
                overall += con.Monthly_Rent__c/2;
            }

        }
        leasePricing.put('Overall', overall);
        return leasePricing;
    }

    //update remaining amount on account
    @AuraEnabled(Cacheable=false)
    public static void updateRemainingAmount(Id accountId, Decimal newVal) {
        Account acc = [SELECT Id, Remaining_Amount__c FROM Account WHERE Id = :accountId];
        acc.Remaining_Amount__c = newVal;
        update acc;
    }

    //query remaining amount to be paid
    @AuraEnabled(Cacheable=false)
    public static Decimal retrieveRemainingAmount(Id accountId) {
        Account acc = [SELECT Id, Remaining_Amount__c FROM Account WHERE Id = :accountId];
        if(acc.Remaining_Amount__c == null) {
            acc.Remaining_Amount__c = 0;
            update acc;
            return 0;
        }
        else {
            return acc.Remaining_Amount__c;
        }
    }

    //creates invoice, adds invoice items to invoice, and attempts payment
    @AuraEnabled
    public static String createInvoice(String accId, String contactId, String customerId, String source){
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://api.stripe.com/v1/invoices');
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setHeader('Authorization', 'Bearer ' + STRIPE_SECRET_KEY);

        // Set the request body
        String body = 'auto_advance=true&collection_method=charge_automatically&customer=' + customerId + '&default_payment_method=' +
            source;
        request.setBody(body);

        // Send the HTTP request and handle the response
        HttpResponse response = http.send(request);
        List<String> returnList = new List<String>();
        returnList.add(String.valueOf(response.getStatusCode()));
        if (response.getStatusCode() == 200) {
            // Success - parse the response data
            Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            String invoiceId = (String) data.get('id');
            addLeasePricingsToInvoice(accId, customerId, invoiceId);
            finalizeInvoice(invoiceId);
            payInvoice(invoiceId);
            addPdfToAccount(contactId, invoiceId);
            return invoiceId;
        } else {
            return String.valueOf(response.getBody());
            // Handle error
        }
    }

    //finalize invoice
    @AuraEnabled
    public static String finalizeInvoice(String invoiceId){
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://api.stripe.com/v1/invoices/' + invoiceId + '/finalize');
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setHeader('Authorization', 'Bearer ' + STRIPE_SECRET_KEY);

        
        // Send the HTTP request and handle the response
        HttpResponse response = http.send(request);
        List<String> returnList = new List<String>();
        returnList.add(String.valueOf(response.getStatusCode()));
        if (response.getStatusCode() == 200) {
            // Success - parse the response data
            Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            
            String newInvoiceId = (String) data.get('id');
            return newInvoiceId;
        } else {
            return String.valueOf(response.getBody());
            // Handle error
        }
    }

    //Pay invoice
    @AuraEnabled
    public static String payInvoice(String invoiceId){
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://api.stripe.com/v1/invoices/' + invoiceId + '/pay');
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setHeader('Authorization', 'Bearer ' + STRIPE_SECRET_KEY);

        
        // Send the HTTP request and handle the response
        HttpResponse response = http.send(request);
        List<String> returnList = new List<String>();
        returnList.add(String.valueOf(response.getStatusCode()));
        if (response.getStatusCode() == 200) {
            // Success - parse the response data
            Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            
            String newInvoiceId = (String) data.get('id');
            return newInvoiceId;
        } else {
            return String.valueOf(response.getBody());
            // Handle error
        }
    }

    //add invoice item to invoice
    @AuraEnabled
    public static String createInvoiceItem(String customerId, Decimal amount, String description, String invoiceId, List<String> discounts){
        String discountsParsed = '['+String.join(discounts, ',')+']';
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://api.stripe.com/v1/invoiceitems');
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setHeader('Authorization', 'Bearer ' + STRIPE_SECRET_KEY);

        // Set the request body

        String body = 'customer=' + customerId + '&amount=' + (amount*100).intValue() + '&description=' + description + '&invoice=' + invoiceId;
        if(discountsParsed != '') {
            for(String discount: discounts){
                body += '&discounts[]coupon=' + discount;
            }
            //body += '&discounts[]coupon=' + discountsParsed;
        }
        request.setBody(body);
        
        HttpResponse response = http.send(request);
        List<String> returnList = new List<String>();
        returnList.add(String.valueOf(response.getStatusCode()));
        if (response.getStatusCode() == 200) {
            // Success - parse the response data
            Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            
            String invoiceItemId = (String) data.get('id');
            return invoiceItemId;
        } else {
            return String.valueOf(response.getBody());
            // Handle error
        }
    }

    //retrieve invoice
    @AuraEnabled
    public static string getInvoice(String invoiceId){
        System.debug(invoiceId);
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://api.stripe.com/v1/invoices/'+invoiceId);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setHeader('Authorization', 'Bearer ' + STRIPE_SECRET_KEY);


        // Send the HTTP request and handle the response
        HttpResponse response = http.send(request);
        if (response.getStatusCode() == 200) {
            // Success - parse the response data
            Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            // Use the invoice data...
            return String.valueOf(response.getBody());
        } else {
            return String.valueOf(response);
            // Handle error
        }
    }

    //return id of default card of customer
    @AuraEnabled
    public static string getCustomerDefault(String customerId){
        Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(getCustomerInfo(customerId));
        return (String) data.get('default_source');
    }

    //update customers default card
    @AuraEnabled
    public static String updateCustomerDefault(String customerId, String source){
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://api.stripe.com/v1/customers/' + customerId);
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setHeader('Authorization', 'Bearer ' + STRIPE_SECRET_KEY);

        // Set the request body
        String body = 'default_source='+ source;
        request.setBody(body);

        // Send the HTTP request and handle the response
        HttpResponse response = http.send(request);
        if (response.getStatusCode() == 200) {
            // Success - parse the response data
            Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            String sourceId = (String) data.get('default_source');
            return sourceId;
        } else {
            return String.valueOf(response.getBody());
            // Handle error
        }
    }

    //get auto payment field in account
    @AuraEnabled
    public static Boolean getAutoPayments(Id accountId) {
        Account acc = [SELECT Id, AutomaticPayments__c FROM Account WHERE Id = :accountId];
        return acc.AutomaticPayments__c;
    }

    //set auto payment field in account
    @AuraEnabled(Cacheable=false)
    public static void setAutoPayments(Id accountId, Boolean setting) {
        Account acc = [SELECT Id, AutomaticPayments__c FROM Account WHERE Id = :accountId];
        acc.AutomaticPayments__c = setting;
        update acc;
    }

    //save pdf to users files
    @AuraEnabled
    public static void addPdfToAccount(Id contactId, String invoice) {
        User communityUser = [SELECT Id, Name, FirstName, Email FROM User WHERE ContactId =:contactId];
        Id userId = communityUser.Id;
        Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(getInvoice(invoice));
        String pdfLink = (String) data.get('invoice_pdf');
        HttpRequest request = new HttpRequest();
        HttpResponse response;

        // Set the URL of the PDF file you want to download
        system.debug(pdfLink);
        request.setEndpoint(pdfLink);
        request.setMethod('GET');
        response = new Http().send(request);
        System.debug('res is>>>>>>'+response);
        System.debug('res.getBody()>>>>>>'+response.getBody());

        response = new Http().send(request);
        //Redirect if needed
        while (response.getStatusCode() == 302) {
            request.setEndpoint(response.getHeader('Location'));
            response = new Http().send(request);
            System.debug('res is>>>>>>'+response);
            System.debug('res.getBody()>>>>>>'+response.getBody());
        }

        // Check the status code of the response
        if (response.getStatusCode() == 200) {
            system.debug('was 200');

            String name = (String) data.get('customer_name');
            String todayDate = Date.today().format();
            String pdfName = 'Invoice_'+name.replace(' ', '_')+'_'+todayDate.replace('/', '-')+'.pdf';

            //create the file under the current user
            ContentVersion version = new ContentVersion();
            version.firstPublishLocationId = userinfo.getUserId();
            version.VersionData = response.getBodyAsBlob();
            version.Title = pdfName;
            version.PathOnClient = pdfName;
            version.ContentLocation = 'S'; // S means "Salesforce CRM Content"
            version.SharingOption = 'A';
            version.Origin = 'H';
            version.OwnerId = userinfo.getUserId();
            insert version;

            //in case if made with the bot, change user to actual current user
            ContentVersion conDoc = [SELECT Id, OwnerId FROM ContentVersion WHERE Id =:version.Id];

            conDoc.OwnerId = userId;
            update conDoc;


            //Send email
            List<Messaging.SingleEmailMessage> emailList = new List<Messaging.SingleEmailMessage>();
            EmailTemplate emailTemplate = [SELECT Id, Subject, HtmlValue, Body FROM EmailTemplate WHERE Id = '00XDn000000qHAzMAM'];
            
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            mail.setTemplateId('00XDn000000qHAzMAM');
            mail.setTargetObjectId(contactId);
            mail.setSaveAsActivity(false);
            mail.setUseSignature(false);

            //Add pdf to email
            Messaging.EmailFileAttachment emlAtt = new Messaging.EmailFileAttachment();
            emlAtt.setFilename(pdfName);
            emlAtt.setBody(response.getBodyAsBlob());
            mail.setFileAttachments(new List<Messaging.EmailFileAttachment>{emlAtt});
            
            emailList.add(mail);
            
            //Send email
            if(!emailList.isEmpty()){
                Messaging.sendEmail(emailList);
            }    
        }
        else {
                system.debug('Was not 200');
                system.debug(response.getStatusCode());
        }

    }

    //Create a coupon
    @AuraEnabled
    public static String createCoupon(Decimal percent, String discountName){
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://api.stripe.com/v1/coupons');
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setHeader('Authorization', 'Bearer ' + STRIPE_SECRET_KEY);

        // Set the request body
        String body = 'name=' + discountName + '&percent_off=' + percent;
        request.setBody(body);

        // Send the HTTP request and handle the response
        HttpResponse response = http.send(request);
        if (response.getStatusCode() == 200) {
            // Success - parse the response data
            Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            String couponId = (String) data.get('id');
            return couponId;
        } else {
            return String.valueOf(response.getBody());
            // Handle error
        }
    }

    //Delete card
    @AuraEnabled
    public static void deleteCard(String customerId, String cardId){
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://api.stripe.com/v1/customers/'+customerId+'/sources/'+cardId);
        request.setMethod('DELETE');
        request.setHeader('Authorization', 'Bearer ' + STRIPE_SECRET_KEY);

        HttpResponse response = http.send(request);
    }

    // @AuraEnabled
    // public static void sendEmail(String accountId, String invoiceId){
    //     User communityUser = [SELECT Id,Name,Email FROM User WHERE ContactId =:contactId];
    //     Id userId = communityUser.Id;
    //     Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(getInvoice(invoice));
    //     String pdfLink = (String) data.get('invoice_pdf');
    // }

}
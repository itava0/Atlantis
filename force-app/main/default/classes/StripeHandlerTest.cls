@IsTest
public class StripeHandlerTest {
    
    @TestSetup
    static void setup() {
        // Create common test accounts
        List<Account> testAccts = new List<Account>();
        for(Integer i=0;i<2;i++) {
            testAccts.add(new Account(Name = 'TestAcct'+i, RecordTypeId = '012Dn000000gfNnIAI'));
        }
        insert testAccts;
        //testAccts = [SELECT Id FROM Account];
    }
    
	private class Mock implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            if (req.getEndpoint().endsWith('v1/customers')) {
                HTTPResponse res = new HTTPResponse();
                res.setBody('{"id":"cus_12345"}');
                res.setStatusCode(200);
                return res;
            } 
            else if (req.getEndpoint().endsWith('cus_12345')) {
                HTTPResponse res = new HTTPResponse();
                res.setBody('{"id":"cus_12345"}');
                res.setStatusCode(200);
                return res;
            } 
            else if(req.getEndpoint().endsWith('v1/tokens')) {
                HTTPResponse res = new HTTPResponse();
                res.setBody('{"id":"tok_12345"}');
                res.setStatusCode(200);
                return res;
            }
            else if(req.getEndpoint().endsWith('v1/charges')) {
                HTTPResponse res = new HTTPResponse();
                res.setBody('{"id":"ch_12345"}');
                res.setStatusCode(200);
                return res;
            }
            else if(req.getEndpoint().endsWith('cus_12345/sources')) {
                HTTPResponse res = new HTTPResponse();
                res.setBody('{"id":"tok_12345"}');
                res.setStatusCode(200);
                return res;
            }
            else {
                System.assert(false, 'unexpected endpoint ' + req.getEndpoint());
                return null;
            }
            //return null;
        }
    }
    
    @isTest
    static void getAccIdTest() {
        Contact con = [SELECT Id FROM Contact LIMIT 1];
        String accId = StripeHandler.getAccId(con.Id);
        Account acc = [SELECT Id FROM Account WHERE Id =: accId LIMIT 1];
        System.assertEquals(acc.Id, accId);
    }
    
    @isTest
    static void createCustomerTest() {
		Account acc = [SELECT Id FROM Account LIMIT 1];
		Test.setMock(HttpCalloutMock.class, new Mock());
        Test.startTest();
		String cusId = StripeHandler.createCustomer(acc.Id);
        Test.stopTest();
        System.assertEquals('cus_12345', cusId);
    }
    
    @isTest
    static void getCustomerInfoTest() {
        Account acc = [SELECT Id FROM Account LIMIT 1];
		Test.setMock(HttpCalloutMock.class, new Mock());
        Test.startTest();
        Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(StripeHandler.getCustomerInfo('cus_12345'));
        String cusId = (String) data.get('id');
        Test.stopTest();
        System.assertEquals('cus_12345', cusId);
    }
    
    @isTest
    static void updateCustomerId() {
        Account acc = [SELECT Id FROM Account LIMIT 1];
        Test.startTest();
        StripeHandler.updateCustomerId(acc.Id, 'cus_12345');
        Test.stopTest();
        Account acc2 = [SELECT Id, CustomerId__c FROM Account WHERE Id =: acc.Id];
        System.assertEquals('cus_12345', acc2.CustomerId__c);
    }
    
    @isTest
    static void createTokenTest() {
        Account acc = [SELECT Id FROM Account LIMIT 1];
		Test.setMock(HttpCalloutMock.class, new Mock());
        Test.startTest();
        String tokId = StripeHandler.createToken(acc.Id, '1234123412341234', '3', '2035', '123');
        Test.stopTest();
        System.assertEquals('tok_12345', tokId);
    }
    
    @isTest
    static void makePaymentTest() {
        Account acc = [SELECT Id FROM Account LIMIT 1];
		Test.setMock(HttpCalloutMock.class, new Mock());
        Test.startTest();
        String chId = StripeHandler.makePayment('tk_12345', 500, 'cus_12345');
        Test.stopTest();
        System.assertEquals('ch_12345', chId);
    }
}
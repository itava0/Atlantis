public with sharing class PdfGenerator {

    @AuraEnabled(Cacheable=true)
    public static Contract getLease(Id leaseId) {
        return [SELECT AccountId, Property__c, Monthly_Rent__c, StartDate, EndDate FROM Contract WHERE ID = :leaseId];
    }

    @AuraEnabled(Cacheable=true)
    public static Property__c getProperty(Id propertyId) {
        return [SELECT Billing_Street__c, Billing_City__c, Billing_State__c, Billing_Postal_Code__c, Rent__c FROM Property__c WHERE ID = :propertyId];
    }

    @AuraEnabled(Cacheable=true)
    public static Account getName(Id accountId) {
        return [SELECT Name FROM Account WHERE ID = :accountId];
    }

    @AuraEnabled(Cacheable=false)
    public static String savePDF(String pdf, String name, Id leaseId) { 

        Blob body = EncodingUtil.base64Decode(pdf);
        string filename = name + ' lease';
            
        attachment theFile = new attachment();
            
        theFile.isPrivate = false;
        theFile.body = body;
        theFile.ParentId = leaseId;
        theFile.Name = filename+ '.pdf';
        theFile.contentType = 'application/pdf';
    
        insert theFile;
    
        return 'Sucessfull';
    }
}
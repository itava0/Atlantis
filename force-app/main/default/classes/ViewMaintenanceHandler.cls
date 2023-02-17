public without sharing class ViewMaintenanceHandler {
    @AuraEnabled(Cacheable=true)
    public static List<Case> getBaseRequests(Id AccountId) {
        Set<Id> propIds = new Set<Id>();
        List<Property_Owner__c> props = [SELECT Account__c, Property__c FROM Property_Owner__c WHERE Account__c=:AccountId];
        for(Property_Owner__c prop : props) {
            propIds.add(prop.Property__c);
        }
        return [SELECT Id, CaseNumber, PropertyId__r.Billing_Street__c, CreatedDate, ClosedDate, Subject, Description, Type, Overall__c FROM Case WHERE PropertyId__c IN :propIds];
    }

    @AuraEnabled(Cacheable=true)
    public static List<Property__c> getProperties(Id AccountId) {
        Set<Id> propIds = new Set<Id>();
        List<Property_Owner__c> props = [SELECT Account__c, Property__c FROM Property_Owner__c WHERE Account__c=:AccountId];
        for(Property_Owner__c prop : props) {
            propIds.add(prop.Property__c);
        }
        return [SELECT Id, Billing_Street__c FROM Property__c WHERE Id IN:propIds];
    }

    @AuraEnabled(Cacheable=true)
    public static List<Case> getFilteredRequests(Id AccountId, String searchSubject, String searchProperty, String searchType, String open, String searchMin, String searchMax) {
        Set<Id> propIds = new Set<Id>();
        List<Property_Owner__c> props = [SELECT Account__c, Property__c FROM Property_Owner__c WHERE Account__c=:AccountId];
        for(Property_Owner__c prop : props) {
            propIds.add(prop.Property__c);
        }

        String subjectText = '%'+searchSubject+'%';
        String propertyText = '%'+searchProperty+'%';
        String typeTest = '%'+searchType+'%';
        if(searchMax == '') {
            searchMax = '5';
        }

        if(open.equals('both')) {
            if(searchType == '') {
                if(searchMin == '') {
                    return [SELECT Id, CaseNumber, PropertyId__r.Billing_Street__c, CreatedDate, ClosedDate, Subject, Description, Type, Overall__c FROM Case 
                    WHERE PropertyId__c IN :propIds AND
                    Subject LIKE :subjectText AND
                    PropertyId__r.Billing_Street__c LIKE :propertyText AND 
                    (Overall__c = NULL OR
                    Overall__c <= :integer.valueof(searchMax))];
                }
                else {
                    return [SELECT Id, CaseNumber, PropertyId__r.Billing_Street__c, CreatedDate, ClosedDate, Subject, Description, Type, Overall__c FROM Case 
                    WHERE PropertyId__c IN :propIds AND
                    Subject LIKE :subjectText AND
                    PropertyId__r.Billing_Street__c LIKE :propertyText AND 
                    Overall__c >= :integer.valueof(searchMin) AND 
                    Overall__c <= :integer.valueof(searchMax)];
                }
            }
            else {
                if(searchMin == '') {
                    return [SELECT Id, CaseNumber, PropertyId__r.Billing_Street__c, CreatedDate, ClosedDate, Subject, Description, Type, Overall__c FROM Case 
                    WHERE PropertyId__c IN :propIds AND
                    Subject LIKE :subjectText AND
                    PropertyId__r.Billing_Street__c LIKE :propertyText AND 
                    Type LIKE :searchType AND
                    (Overall__c = NULL OR
                    Overall__c <= :integer.valueof(searchMax))];
                }
                else {
                    return [SELECT Id, CaseNumber, PropertyId__r.Billing_Street__c, CreatedDate, ClosedDate, Subject, Description, Type, Overall__c FROM Case 
                    WHERE PropertyId__c IN :propIds AND
                    Subject LIKE :subjectText AND
                    PropertyId__r.Billing_Street__c LIKE :propertyText AND 
                    Type LIKE :searchType AND
                    Overall__c >= :integer.valueof(searchMin) AND 
                    Overall__c <= :integer.valueof(searchMax)];
                }
            }
        }
        else if(open.equals('closed')){
            if(searchType == '') {
                if(searchMin == '') {
                    return [SELECT Id, CaseNumber, PropertyId__r.Billing_Street__c, CreatedDate, ClosedDate, Subject, Description, Type, Overall__c FROM Case 
                    WHERE PropertyId__c IN :propIds AND
                    Subject LIKE :subjectText AND
                    PropertyId__r.Billing_Street__c LIKE :propertyText AND 
                    ClosedDate != NULL AND
                    (Overall__c = NULL OR
                    Overall__c <= :integer.valueof(searchMax))];
                }
                else {
                    return [SELECT Id, CaseNumber, PropertyId__r.Billing_Street__c, CreatedDate, ClosedDate, Subject, Description, Type, Overall__c FROM Case 
                    WHERE PropertyId__c IN :propIds AND
                    Subject LIKE :subjectText AND
                    PropertyId__r.Billing_Street__c LIKE :propertyText AND 
                    ClosedDate != NULL AND
                    Overall__c >= :integer.valueof(searchMin) AND 
                    Overall__c <= :integer.valueof(searchMax)];
                }
            }
            else {
                if(searchMin == '') {
                    return [SELECT Id, CaseNumber, PropertyId__r.Billing_Street__c, CreatedDate, ClosedDate, Subject, Description, Type, Overall__c FROM Case 
                    WHERE PropertyId__c IN :propIds AND
                    Subject LIKE :subjectText AND
                    PropertyId__r.Billing_Street__c LIKE :propertyText AND 
                    Type LIKE :searchType AND
                    ClosedDate != NULL AND
                    (Overall__c = NULL OR
                    Overall__c <= :integer.valueof(searchMax))];
                }
                else {
                    return [SELECT Id, CaseNumber, PropertyId__r.Billing_Street__c, CreatedDate, ClosedDate, Subject, Description, Type, Overall__c FROM Case 
                    WHERE PropertyId__c IN :propIds AND
                    Subject LIKE :subjectText AND
                    PropertyId__r.Billing_Street__c LIKE :propertyText AND 
                    Type LIKE :searchType AND
                    ClosedDate != NULL AND
                    Overall__c >= :integer.valueof(searchMin) AND 
                    Overall__c <= :integer.valueof(searchMax)];
                }
            }

        }
        else {
            if(searchType == '') {
                if(searchMin == '') {
                    return [SELECT Id, CaseNumber, PropertyId__r.Billing_Street__c, CreatedDate, ClosedDate, Subject, Description, Type, Overall__c FROM Case 
                    WHERE PropertyId__c IN :propIds AND
                    Subject LIKE :subjectText AND
                    PropertyId__r.Billing_Street__c LIKE :propertyText AND 
                    ClosedDate = NULL AND
                    (Overall__c = NULL OR
                    Overall__c <= :integer.valueof(searchMax))];
                }
                else {
                    return [SELECT Id, CaseNumber, PropertyId__r.Billing_Street__c, CreatedDate, ClosedDate, Subject, Description, Type, Overall__c FROM Case 
                    WHERE PropertyId__c IN :propIds AND
                    Subject LIKE :subjectText AND
                    PropertyId__r.Billing_Street__c LIKE :propertyText AND 
                    ClosedDate = NULL AND
                    Overall__c >= :integer.valueof(searchMin) AND 
                    Overall__c <= :integer.valueof(searchMax)];
                }
            }
            else {
                if(searchMin == '') {
                    return [SELECT Id, CaseNumber, PropertyId__r.Billing_Street__c, CreatedDate, ClosedDate, Subject, Description, Type, Overall__c FROM Case 
                    WHERE PropertyId__c IN :propIds AND
                    Subject LIKE :subjectText AND
                    PropertyId__r.Billing_Street__c LIKE :propertyText AND 
                    Type LIKE :searchType AND
                    ClosedDate = NULL AND
                    (Overall__c = NULL OR
                    Overall__c <= :integer.valueof(searchMax))];
                }
                else {
                    return [SELECT Id, CaseNumber, PropertyId__r.Billing_Street__c, CreatedDate, ClosedDate, Subject, Description, Type, Overall__c FROM Case 
                    WHERE PropertyId__c IN :propIds AND
                    Subject LIKE :subjectText AND
                    PropertyId__r.Billing_Street__c LIKE :propertyText AND 
                    Type LIKE :searchType AND
                    ClosedDate = NULL AND
                    Overall__c >= :integer.valueof(searchMin) AND 
                    Overall__c <= :integer.valueof(searchMax)];
                }
            }
        }

        //return [SELECT Id, CaseNumber, PropertyId__r.Billing_Street__c, CreatedDate, ClosedDate, Subject, Description, Type, Overall__c FROM Case WHERE PropertyId__c IN :propIds];
    }

    @AuraEnabled(Cacheable=false)
    public static void deleteRequests(List<Id> idList) {
        delete [SELECT Id FROM Case WHERE Id IN :idList];
    }

    @AuraEnabled
    public static Case getRequest(String caseId) {
        Case item = [SELECT Id, CaseNumber, PropertyId__r.Billing_Street__c, CreatedDate, ClosedDate, Subject, Description, Type, Overall__c, Priority, Status FROM Case WHERE Id =:caseId];
        return item;
    }

}
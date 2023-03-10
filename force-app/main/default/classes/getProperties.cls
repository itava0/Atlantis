public with sharing class getProperties {
	@AuraEnabled(cacheable=true)
    // All Info from Properties (only when necessary)
    public static List<Property__c> getAllProperties() {
		return [SELECT Id, Billing_Street__c, Billing_City__c, Geolocation__Latitude__s, Geolocation__Longitude__s FROM Property__c];        
    }
    
    // Contact Id from User
    @AuraEnabled(cacheable=true)
    public static List<User> getContactFromUser(Id usrId) {
        return [SELECT ContactId FROM User WHERE Id =: usrId];
	}
    
    // Account Id from Contact
    @AuraEnabled(cacheable=true)
    public static List<Contact> getAccountFromContact(Id conId) {
        return [SELECT AccountId, FirstName, LastName, MailingLatitude, MailingLongitude FROM Contact WHERE Id =: conId];
    }
    
    // Record Type from Account
    @AuraEnabled(cacheable=true)
    public static List<Account> getTypeFromAccount(Id accId) {
        return [SELECT RecordTypeId, BillingLatitude, BillingLongitude FROM Account WHERE Id =: accId];
	}
    
    // Property Owner Junction Object from Account
    @AuraEnabled(cacheable=true)
    public static List<Property_Owner__c> getPropertyOwnersFromAccount(Id accId) {
        return [SELECT Id, Property__c FROM Property_Owner__c WHERE Account__c =: accId];
	}
    
    // Tenant Junction Object from Account
    @AuraEnabled(cacheable=true)
    public static List<Tenant__c> getTenantsFromAccount(Id accId) {
        return [SELECT Id, Property__c FROM Tenant__c WHERE Account__c =: accId];
	}
    
    // Staff Junction Object from Single Account
    @AuraEnabled(cacheable=true)
    public static List<Staff__c> getStaffFromAccount(Id accId) {
        return [SELECT Id, Property__c, Role__c FROM Staff__c WHERE Account__c =: accId];
    }
    
    // Staff Junction Object from Multiple Accounts
    @AuraEnabled(cacheable=true)
    public static List<Staff__c> getStaffFromAccounts(List<Id> accIds) {
        return [SELECT Id, Account__c, Property__c, Role__c, Account__r.Name, Account__r.Phone, Account__r.Email__c, Property__r.Name FROM Staff__c WHERE Account__c IN: accIds];
    }
    
    // Property Owner Junction Object from Property
    @AuraEnabled(cacheable=true)
    public static List<Property_Owner__c> getPropertyOwnersFromProperty(Id propId) {
        return [SELECT Id, Account__c FROM Property_Owner__c WHERE Property__c =: propId];
    }
    
    // Properties from Property Owner
    @AuraEnabled(cacheable=true)
    public static List<Property__c> getPortfolioProperties(List<Id> propOwnerIds) {
        return [SELECT Id, Name, Billing_Street__c, Billing_City__c, Billing_State__c, Billing_Postal_Code__c, Billing_Country__c,
                Geolocation__Latitude__s, Geolocation__Longitude__s, Score__c, Rating__c, Rating_Count__c, Picture__c, RecordType.Name,
                Status__c, Year_Built__c, Market_Price__c, Rent__c, Date_Listed__c, Days_On_Market__c, Bedrooms__c, Bathrooms__c, Balconies__c, Showers__c
                FROM Property__c];
	}
    
    // Number of Ratings from Property
    @AuraEnabled(cacheable=true)
    public static Integer getRatingCount(Id propId) {
        return [SELECT COUNT() FROM Rating__c WHERE Property__c =: propId];
	}
    
    // Name from Account
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccountName(Id accId) {
        return [SELECT Id, Name FROM Account WHERE Id =: accId];
    }
    
    // Rating from Property + User Combination
    @AuraEnabled(cacheable=true)
    public static List<Rating__c> getUniqueRating(Id propId, Id usrId) {
        return [SELECT Id FROM Rating__C WHERE Property__c =: propId AND User__c =: usrId];
    }
    
    // Account Ratings from User + Accounts
    @AuraEnabled(cacheable=true)
    public static List<AccRating__c> getMultipleRatings(List<Id> accIds, Id usrId) {
        return [SELECT Id, Account__c FROM AccRating__c WHERE User__c =: usrId AND Account__c IN: accIds];
    }
    
    // Rating Info from Property
    @AuraEnabled(cacheable=true)
    public static List<Property__c> getSingleProperty(Id propId) {
        return [SELECT Id, Score__c, Rating__c, Rating_Count__c FROM Property__c WHERE Id =: propId];
	}
    
    // Rating Info from Accounts
    @AuraEnabled(cacheable=true)
    public static List<Account> getMultipleAccounts(List<Id> accIds) {
        System.debug(accIds);
        return [SELECT Id, Name, Score__c, Rating__c, Rating_Count__c FROM Account WHERE Id IN: accIds];
    }
    
    // Rating Info from Rating
    @AuraEnabled(cacheable=true)
    public static List<Rating__c> getPropertyRatings(Id propId) {
        return [SELECT Id, Score__c, Review__c, Property__c, User__c, User__r.Name FROM Rating__c WHERE Property__c =: propId];
    }
    
    // Account Rating Info from Account Rating
    @AuraEnabled(cacheable=true)
    public static List<AccRating__c> getAccountRatings(Id accId) {
        return [SELECT Id, Score__c, Review__c, Account__c, User__c, User__r.Name FROM AccRating__c WHERE Account__c =: accId];
    }
    
    // Lease Information from Property
    @AuraEnabled(cacheable=true)
    public static List<Contract> getLease(Id propId) {
        return [SELECT Id, Property__c FROM Contract WHERE Property__c =: propId];
    }
    
    // Lease History from Lease
    @AuraEnabled(cacheable=true)
    public static List<ContractHistory> getLeaseHistory(Id contId) {
        return [SELECT Id, ContractId, Field, OldValue, NewValue, CreatedDate FROM ContractHistory WHERE ContractId =: contId];
    }
    
    // Inspections from Property
    @AuraEnabled(cacheable=true)
    public static List<Inspection__c> getUpcomingInspections(Id propId) {
        return [SELECT Id, Property__c, DateTime__c, Inspector__c, Inspector__r.Name, Subjects__c, DateValue__c, TimeValue__c FROM Inspection__c
                WHERE Property__c =: propId AND DateTime__c >= TODAY AND Status__c = 'Pending' ORDER BY DateTime__c ASC];
    }
    
    // Staff Accounts from Account
    @AuraEnabled(cacheable=true)
    public static List<Account> getStaffAccounts() {
        return [SELECT Id, Name FROM Account WHERE RecordType.Name = 'Staff'];
    }
    
    // Staff Junction Object from Property
    @AuraEnabled(cacheable=true)
    public static List<Staff__c> getStaffMembers(Id propId) {
        return [SELECT Id, Account__c, Property__c, Role__c, Account__r.Name, Property__r.Billing_Street__c, Property__r.Name FROM Staff__c WHERE Property__c =: propId];
    }
    
    // Available Staff Properties from Property
    @AuraEnabled(cacheable=true)
    public static List<Property__c> getAvailableStaffProperties(Id propId, Id accId, List<Property__c> portfolio) {
        // Get list of properties in the current user's portfolio
        List<Id> propsToInclude = new List<Id>();
        for (Property__c prop : portfolio) {
            propsToInclude.add(prop.Id);
        }
        
        // Get list of properties to exclude (properties that staff is already assigned to)
        List<Id> propsToExclude = new List<Id>();
        List<Staff__c> stfList = [SELECT Id, Property__c, Account__c FROM Staff__c WHERE Account__c =: accId];
        for (Staff__c stf: stfList) {
            propsToExclude.add(stf.Property__c);
        }
        
        // Return filtered results
        return [SELECT Id, Name, Billing_Street__c FROM Property__c WHERE Id IN: propsToInclude AND Id NOT IN: propsToExclude];
    }
    
    // Staff Role From Property + Account
    @AuraEnabled(cacheable=true)
    public static List<Staff__c> getStaffRole(Id propId, Id accId) {
        return [SELECT Id, Property__c, Account__c, Role__c FROM Staff__c WHERE Property__c =: propId AND Account__c =: accId];
    }
    
    // Accounts for Property Owners from Property
    @AuraEnabled(cacheable=true)
    public static List<Account> getPropertyOwnerAccounts(Id propId) {
        List<Property_Owner__c> ownerList = [SELECT Id, Account__c FROM Property_Owner__c WHERE Property__c =: propId];
        List<Id> accIds = new List<Id>();
        for (Property_Owner__c owner : ownerList) {
            accIds.add(owner.Account__c);
        }
        return [SELECT Id, Name, FirstName, LastName FROM Account WHERE Id IN: accIds];
    }
    
    // Name From Property
    @AuraEnabled(cacheable=true)
    public static List<Property__c> getPropertyName(Id propId) {
        return [SELECT Id, Name, Billing_Street__c FROM Property__c WHERE Id =: propId];
    }
    
    // Geolocation Information from Property
    @AuraEnabled(cacheable=true)
    public static List<Property__c> getPropertyGeo(Id propId) {
        return [SELECT Id, Name, Billing_Street__c, Billing_City__c, Billing_State__c, Billing_Postal_Code__c,
                Geolocation__Latitude__s, Geolocation__Longitude__s FROM Property__c WHERE Id =: propId];
    }
    
    // For Basic Property Info Chart
    @AuraEnabled(cacheable=true)
    public static List<Property__c> propertyChart(Id userId) {
        Id conId;
        Id accId;
        List<Property_Owner__c> owners = new List<Property_Owner__c>();
        List<Id> ownerPropIds = new List<Id>();
        
        if (userId != null) conId = getContactFromUser(userId)[0].ContactId;
        if (conId != null) accId = getAccountFromContact(conId)[0].AccountId;
        if (accId != null) owners = getPropertyOwnersFromAccount(accId);
        for (Property_Owner__c own : owners) {
            ownerPropIds.add(own.Property__c);
        }
        return [SELECT Id, Billing_Street__c, Rent__c, Bedrooms__c, Bathrooms__c, Status__c, Score__c, Date_Listed__c, Community__c, In_Community__c, Community__r.Name
                FROM Property__c WHERE Id IN: ownerPropIds ORDER BY Rent__c];
    }
    
    // Get Cases for Properties
    @AuraEnabled(cacheable=true)
    public static List<Case> propertyCases(Id userId) {
        List<Property__c> propList = propertyChart(userId);
        return [SELECT Id, PropertyId__c, Status FROM Case WHERE PropertyId__c IN: propList];
    }
    
    // Get Communal Spaces for Properties
    @AuraEnabled(cacheable=true)
    public static List<Communal_Space__c> propertySpaces(Id userId) {
        List<Property__c> propList = propertyChart(userId);
        Set<Id> commSet = new Set<Id>();
        for (Property__c prop : propList) {
            if (prop.In_Community__c == true) commSet.add(prop.Community__c);
        }
        List<Communal_Space__c> spcList = [SELECT Id, Community__c, Community__r.Name FROM Communal_Space__c WHERE Community__c IN: commSet];
        return spcList;
    }
}
public with sharing class BotGetProperties {
    public class OrderOutput {
        @InvocableVariable(required=true)
        public String propertyName;

        @InvocableVariable(required=true)
        public String propertyId;

        @InvocableVariable(required=true)
        public List<String> propertiesNames;

        @InvocableVariable(required=true)
        public String propertiesStringsAsString;

        @InvocableVariable(required=true)
        public String propertiesIdsAsString;

        @InvocableVariable(required=true)
        public Integer numProps;
    }
    
    public class OrderInput {
        @InvocableVariable(required=true)
        public String contactId;
    }

    @InvocableMethod(label='Get Properties')
    public static List<OrderOutput> getProperties(List<OrderInput> inputs) {
        List<OrderOutput> outputs = new List<OrderOutput>();
        OrderOutput output = new OrderOutput();
        Contact con = [SELECT AccountId FROM Contact WHERE Id =: inputs[0].contactId];
        Account acc = [SELECT Id FROM Account WHERE Id =: con.AccountId];
        List<Tenant__c> tenList = [SELECT Account__c, Property__c FROM Tenant__c WHERE Account__c=:acc.Id];
        Set<Id> idSet = new Set<Id>();
        for(Tenant__c item:tenList) {
            idSet.add(item.Property__c);
        }
        List<Property__c> propList = [SELECT Id, Billing_Street__c FROM Property__c WHERE Id IN:idSet];
        List<String> propertiesNames = new List<String>();
        String propertiesStringsAsString = '';
        String propertiesIdsAsString = '';
        for(Integer i = 0; i < propList.size(); i += 1) {
            propertiesNames.add(propList[i].Billing_Street__c);
            propertiesStringsAsString += propList[i].Billing_Street__c + '$';
            propertiesIdsAsString += propList[i].Id + '$';
        }

        output.numProps = propList.size();
        output.propertiesIdsAsString = propertiesIdsAsString;
        output.propertiesStringsAsString = propertiesStringsAsString;
        output.propertiesNames = propertiesNames;
        output.propertyName = propList[0].Billing_Street__c;
        output.propertyId = propList[0].Id;
        outputs.add(output);
        return outputs;
    }
}
public with sharing class BotCreateCase {
    public class OrderOutput {
        @InvocableVariable(required=true)
        public String caseNumber;
    }
    
    public class OrderInput {
        @InvocableVariable(required=true)
        public String contactId;

        @InvocableVariable(required=true)
        public String propertyId;

        @InvocableVariable(required=true)
        public String firstName;

        @InvocableVariable(required=true)
        public String lastName;

        @InvocableVariable(required=true)
        public String email;

        @InvocableVariable(required=true)
        public String subject;

        @InvocableVariable(required=true)
        public String description;

        @InvocableVariable(required=true)
        public String type;
    }

    @InvocableMethod(label='Create Case')
    public static List<OrderOutput> createCase(List<OrderInput> inputs) {
        List<OrderOutput> outputs = new List<OrderOutput>();
        OrderOutput output = new OrderOutput();
        Contact con = [SELECT AccountId FROM Contact WHERE Id =: inputs[0].contactId];
        Case newCase = new Case(ContactId = inputs[0].contactId,
                                AccountId = con.AccountId,
                                PropertyId__c = inputs[0].propertyId,
                                Origin = 'Chat',
                                Status = 'New',
                                SuppliedEmail = inputs[0].email,
                                SuppliedName = inputs[0].firstName+' '+inputs[0].lastName,
                                Subject = inputs[0].subject,
                                Description = inputs[0].description,
                                Type = inputs[0].type);
        insert newCase;

        newCase = [SELECT Id, CaseNumber FROM Case WHERE Id =: newCase.Id];

        output.caseNumber = newCase.CaseNumber;
        outputs.add(output);
        return outputs;
    }
}
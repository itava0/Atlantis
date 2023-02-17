public without sharing class StripeBot {

    private static final String STRIPE_SECRET_KEY = 'sk_test_51M3tY3D15KhrjJEhmAhl0nLQeJlPyE0H9aDL9m2QCkELmGI81wz4EZVEA79UhVcs4rdYJICE9PiIb68sSMskxPgw00Tcn94Aib';

    public class OrderOutput {
        @InvocableVariable(required=true)
        public String customerId;

        @InvocableVariable(required=true)
        public Decimal remainingBalance;

        @InvocableVariable
        public Boolean hasCard;
        
        @InvocableVariable(required=true)
        public String defaultCard;

        @InvocableVariable(required=true)
        public String defaultCardId;

        @InvocableVariable(required=true)
        public String accountId;
    }
    
    public class OrderInput {
        @InvocableVariable(required=true)
        public String contactId;
    }

    @InvocableMethod(label='Get Customer Balance')
    public static List<OrderOutput> getCustomerId(List<OrderInput> inputs) {
        List<OrderOutput> outputs = new List<OrderOutput>();
        OrderOutput output = new OrderOutput();
        Contact con = [SELECT Id, AccountId FROM Contact WHERE Id =: inputs[0].contactId];
        Account acc = [SELECT Id FROM Account WHERE Id = :con.AccountId];
        String customerId = StripeHandler.createCustomer(acc.Id);
        output.customerId = customerId;
        output.accountId = acc.Id;
        output.remainingBalance = StripeHandler.retrieveRemainingAmount(acc.Id);
        system.debug('Here');
        Map<String, Object> customerInfo = (Map<String, Object>) JSON.deserializeUntyped(StripeHandler.getCustomerInfo(customerId));
        // String customerInfo = StripeHandler.getCustomerInfo(customerId);
        if((String) customerInfo.get('default_source') != null) {
            String defaultCardId = (String) customerInfo.get('default_source');
            output.defaultCardId = defaultCardId;
            Map<String, Object> defaultCardInfo = (Map<String, Object>) JSON.deserializeUntyped(StripeHandler.getCard(customerId, defaultCardId));
            String defaultCard = 'Card #: •••• •••• •••• ' + (String) defaultCardInfo.get('last4') + '\nExpiration Date: ' +
                String.valueOf((Integer) defaultCardInfo.get('exp_month')) + '/' + String.valueOf((Integer) defaultCardInfo.get('exp_year'));
            output.defaultCard = defaultCard;
            output.hasCard = true;
        }
        else {
            output.hasCard = false;
        }
        outputs.add(output);
        return outputs;
    }

}
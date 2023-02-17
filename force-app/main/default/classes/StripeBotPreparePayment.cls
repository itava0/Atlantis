public with sharing class StripeBotPreparePayment {
    private static final String STRIPE_SECRET_KEY = 'sk_test_51M3tY3D15KhrjJEhmAhl0nLQeJlPyE0H9aDL9m2QCkELmGI81wz4EZVEA79UhVcs4rdYJICE9PiIb68sSMskxPgw00Tcn94Aib';

    public class OrderOutput {
        @InvocableVariable(required=true)
        public String invoiceId;
    }
    
    public class OrderInput {
        @InvocableVariable(required=true)
        public String accountId;

        @InvocableVariable(required=true)
        public String customerId;

        @InvocableVariable(required=true)
        public String source;

        @InvocableVariable(required=true)
        public String contactId;
    }

    @InvocableMethod(label='Prepare Payment')
    public static List<OrderOutput> makePayment(List<OrderInput> inputs) {
        String accountId = inputs[0].accountId;
        String customerId = inputs[0].customerId;
        String source = inputs[0].source;
        String contactId = inputs[0].contactId;

        List<OrderOutput> outputs = new List<OrderOutput>();
        OrderOutput output = new OrderOutput();
        output.invoiceId = StripeHandler.createInvoice(accountId, contactId, customerId, source);
        outputs.add(output);
        return outputs;
    }
}
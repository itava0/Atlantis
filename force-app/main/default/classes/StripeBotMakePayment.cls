public without sharing class StripeBotMakePayment {
    private static final String STRIPE_SECRET_KEY = 'sk_test_51M3tY3D15KhrjJEhmAhl0nLQeJlPyE0H9aDL9m2QCkELmGI81wz4EZVEA79UhVcs4rdYJICE9PiIb68sSMskxPgw00Tcn94Aib';

    public class OrderOutput {
        @InvocableVariable(required=true)
        public Boolean paymentStatus;

        @InvocableVariable(required=true)
        public String failureCode;

        @InvocableVariable(required=true)
        public String failureMessage;
    }
    
      public class OrderInput {
        @InvocableVariable(required=true)
        public String invoiceId;

        @InvocableVariable(required=true)
        public String accountId;
    }

    @InvocableMethod(label='Make Payment')
    public static List<OrderOutput> makePayment(List<OrderInput> inputs) {
        List<OrderOutput> outputs = new List<OrderOutput>();
        OrderOutput output = new OrderOutput();
        // String charge = StripeHandler.makePayment(inputs[0].source, inputs[0].amount, inputs[0].customerId);
        // Map<String, Object> chargeInfo = (Map<String, Object>) JSON.deserializeUntyped(StripeHandler.getCharge(charge));
        // output.paymentStatus = (String) chargeInfo.get('status');
        // if(output.paymentStatus == 'failed') {
        //     output.failureCode = (String) chargeInfo.get('failure_code');
        //     output.failureMessage = (String) chargeInfo.get('failure_message');
        // }
        // else if(output.paymentStatus == 'succeeded'){
        //     Contact con = [SELECT Id, AccountId FROM Contact WHERE Id =: inputs[0].contactId];
        //     StripeHandler.updateRemainingAmount(con.AccountId, 0);
        // }
        // outputs.add(output);
        // return outputs;
        String invoiceId = inputs[0].invoiceId;
        String accountId = inputs[0].accountId;

        Map<String,Object> invoiceData = (Map<String, Object>) JSON.deserializeUntyped(StripeHandler.getInvoice(invoiceId));
        output.paymentStatus = (Boolean) invoiceData.get('paid');
        if((Boolean) invoiceData.get('paid')) {
            StripeHandler.updateRemainingAmount(accountId, 0);
        }
        else {
            Map<String,Object> invoiceErrorData = (Map<String, Object>) invoiceData.get('last_finalization_error');
            output.failureCode = (String) invoiceErrorData.get('code');
            output.failureMessage = (String) invoiceErrorData.get('message');
        }
        outputs.add(output);
        return outputs;
    }
}
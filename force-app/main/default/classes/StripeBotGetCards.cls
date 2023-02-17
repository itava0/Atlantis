public without sharing class StripeBotGetCards {
    private static final String STRIPE_SECRET_KEY = 'sk_test_51M3tY3D15KhrjJEhmAhl0nLQeJlPyE0H9aDL9m2QCkELmGI81wz4EZVEA79UhVcs4rdYJICE9PiIb68sSMskxPgw00Tcn94Aib';

    public class OrderOutput {
        @InvocableVariable(required=true)
        public List<String> cardsStrings;

        @InvocableVariable(required=true)
        public List<String> cardsIds;

        @InvocableVariable(required=true)
        public String cardsStringsAsString;

        @InvocableVariable(required=true)
        public String cardsIdsAsString;
    }
    
    public class OrderInput {
        @InvocableVariable(required=true)
        public String customerId;
    }

    @InvocableMethod(label='Get Cards')
    public static List<OrderOutput> getCards(List<OrderInput> inputs) {
        List<OrderOutput> outputs = new List<OrderOutput>();
        OrderOutput output = new OrderOutput();
        //List<List<String>> outputCards = new List<List<String>>();
        Map<String, Object> allCards = (Map<String, Object>) JSON.deserializeUntyped(StripeHandler.viewAllCards(inputs[0].customerId));
        List<Object> allCardsData = (List<Object>) allCards.get('data');
        //system.debug(((Map<String, Object>)allCardsData[0]).get('last4'));
        List<String> cardsStrings = new List<String>();
        List<String> cardsIds = new List<String>();
        String cardsStringsAsString = '';
        String cardsIdsAsString = '';
        for(Integer i = 0; i < allCardsData.size(); i += 1) {
            String last4 = (String) ((Map<String, Object>) allCardsData[i]).get('last4');
            String exp_month = String.valueOf((Integer) ((Map< String, Object>) allCardsData[i]).get('exp_month'));
            String exp_year = String.valueOf((Integer) ((Map<String, Object>) allCardsData[i]).get('exp_year'));
            String cardString = 'Card #: •••• •••• •••• ' + last4 + '\nExpiration Date: ' +
                    exp_month + '/' + exp_year;
            String cardId = (String) ((Map<String, Object>) allCardsData[i]).get('id');
            cardsStrings.add(cardString);
            cardsIds.add(cardId);
            cardsStringsAsString += cardString + '$';
            cardsIdsAsString += cardId + '$';
        }
        output.cardsStrings = cardsStrings;
        output.cardsIds = cardsIds;
        output.cardsStringsAsString = cardsStringsAsString;
        output.cardsIdsAsString = cardsIdsAsString;
        outputs.add(output);
        return outputs;
    }
}
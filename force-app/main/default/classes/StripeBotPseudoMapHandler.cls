public without sharing class StripeBotPseudoMapHandler {
    public class OrderOutput {
        @InvocableVariable(required=true)
        public String cardId;
    }
    
    public class OrderInput {
        @InvocableVariable(required=true)
        public String cardsStringsAsString;

        @InvocableVariable(required=true)
        public String cardsIdsAsString;

        @InvocableVariable(required=true)
        public String search;
    }

    @InvocableMethod(label='Get Card Id')
    public static List<OrderOutput> getCards(List<OrderInput> inputs) {
        List<OrderOutput> outputs = new List<OrderOutput>();
        OrderOutput output = new OrderOutput();
        List<String> cardsStrings = inputs[0].cardsStringsAsString.split('\\$');
        List<String> cardsIds = inputs[0].cardsIdsAsString.split('\\$');
        for(Integer i = 0; i < cardsStrings.size(); i += 1) {
            if(cardsStrings[i] == inputs[0].search) {
                output.cardId = cardsIds[i];
                outputs.add(output);
                return outputs;
            }
        }
        return outputs;
    }
}
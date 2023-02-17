public with sharing class BotPriceToString {
    public class OrderOutput {
        @InvocableVariable(required=true)
        public String formattedPrice;
    }
    
    public class OrderInput {
        @InvocableVariable(required=true)
        public Decimal Price;
    }

    @InvocableMethod(label='Convert Price to formatted String')
    public static List<OrderOutput> priceToString(List<OrderInput> inputs) {
        List<OrderOutput> outputs = new List<OrderOutput>();
        OrderOutput output = new OrderOutput();
        Decimal x = inputs[0].Price;
        String y = String.valueOf(x);
        String z = '.';
        if(y.contains(',')) {
            z = ',';
        }
        y = y.substring(0, y.indexOf(z));
        if(x - Decimal.valueOf(y) == 0) {
            output.formattedPrice = String.valueOf(x.format()) + z + '00';
        }
        else {
            output.formattedPrice = String.valueOf(x.format());
        }
        outputs.add(output);
        return outputs;
    }


}
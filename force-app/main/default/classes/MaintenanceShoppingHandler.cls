public without sharing class MaintenanceShoppingHandler {

    private static final String TextRazor_API_KEY = 'd662db23d4ddfb3400d815480fc740e9b68c01b261fb65e9a9718a70';
    private static final String GoogleSearch_API_KEY = 'AIzaSyAXP1IZ9gcbiO53-TrPgS_6rvbcH0h0Q_8';

    @AuraEnabled
    public static List<Object> searchItem(String query) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://www.googleapis.com/customsearch/v1?key='+GoogleSearch_API_KEY+'&cx=241b0b86cc9b0494e&q='+query);
        req.setMethod('GET');


        Http http = new Http();
        HttpResponse res = http.send(req);
        //system.debug(res.getBody());
        if (res.getStatusCode() == 200) {
            // Success - parse the response data
            Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            List<Object> data2 = (List<Object>) data.get('items');
            return data2;
        } else {
            return null;
            // Handle error
        }
    }

    @AuraEnabled(Cacheable=true)
    public static List<String> readText(String caseId) {
        Case curCase = [SELECT Id, Subject, Description FROM Case WHERE Id=:caseId];
        String text = curCase.Description;

        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://api.textrazor.com');
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.setHeader('x-textrazor-key', TextRazor_API_KEY);

        // Set the request body
        String body = 'extractors=words&text='+ text;
        request.setBody(body);

        HttpResponse response = http.send(request);
        system.debug(response.getBody());
        Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
        data = (Map<String, Object>) data.get('response');
        List<Object> sentences = (List<Object>) data.get('sentences');
        Set<String> words = new Set<String>();
        for(Integer i = 0; i < sentences.size(); i++) {
            List<Object> wordsObjects = (List<Object>) ((Map<String, Object>) sentences[i]).get('words');
            for(Integer j = 0; j < wordsObjects.size(); j++) {
                if(((String)((Map<String, Object>) wordsObjects[j]).get('partOfSpeech')).contains('NN')) {
                    system.debug((String)((Map<String, Object>) wordsObjects[j]).get('token'));
                    words.add((String)((Map<String, Object>) wordsObjects[j]).get('token'));
                }
            }
        }
        // for(Object sentenceObject:sentences) {
        //     for(Object item:((Map<String, Object>)sentenceObject).get('words')) {
        //         system.debug('something'+item);
        //         // returnList.add((String)(((Map<String, Object>)item).get('entityId')));
        //     }
        // }
        system.debug(sentences);
        return new List<String>(words);
        // List<String> returnList = new List<String>();
        // if(data2 !=)
        // return returnList;
    }
}
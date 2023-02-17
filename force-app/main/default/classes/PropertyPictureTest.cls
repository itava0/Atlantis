public class PropertyPictureTest {
    public static void getIds() {
        List<Id> idList = new List<Id>();
        List<ContentDocumentLink> linkList = [SELECT Id FROM ContentDocumentLink WHERE LinkedEntityID = 'a02Dn000001HMtMIAW'];
        for (ContentDocumentLink cdl : linkList) {
            idList.add(cdl.Id);
        }
    	System.debug(linkList);
        System.debug(idList);
	}
}
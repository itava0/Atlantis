public class ImportCXPWSchedulable implements Schedulable {
	public void execute(SchedulableContext SC) {
      insert new CXPW_Import__c();
   }
}
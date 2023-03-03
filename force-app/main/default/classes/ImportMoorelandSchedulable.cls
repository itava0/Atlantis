public class ImportMoorelandSchedulable implements Schedulable {
	public void execute(SchedulableContext SC) {
      insert new MoorelandImport__c();
   }
}
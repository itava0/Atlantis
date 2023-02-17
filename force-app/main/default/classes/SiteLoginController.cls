/**
 * An apex page controller that exposes the site login functionality
 */
global with sharing class SiteLoginController {
    private class CustomException extends Exception{}
    global String username {get; set;}
    global String password {get; set;}

    global PageReference login() {
        String startUrl = System.currentPageReference().getParameters().get('startURL');
        User usr = [SELECT Email_Verified__C FROM User WHERE username = :username];
        return Site.login(username, password, startUrl);
    }
    
   	global SiteLoginController () {}
}
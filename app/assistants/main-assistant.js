/* this file contains all of the javascript that will be automatically loaded along with the main-scene.html, which is found in the ~/app/views/main/ folder */

function MainAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this._homeURL = "http://darkstar.x10host.com/news_31/index.html";
	this._lastURL = this._homeURL;
	this._baseURL = "http://darkstar.x10host.com/news_31/mobilizer/read.php/?a=";
	this._prefsURL = "http://darkstar.x10host.com/news_31/preferences.html";
}

MainAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */

	/* the next four lines, including the one I commented out, create the webview widget. */

	this.controller.setupWidget('web-view', {
		url: this._homeURL,  /// SUBSTITUTE YOUR WEB ADDRESS HERE. THAT'S IT. EASY LIKE CAKE!
		showClickedLink: true,
		interrogateClicks: false,
	}, this.mainViewModel = {});

	/* add app menu */
	this.controller.setupWidget(Mojo.Menu.appMenu,
	this.attributes = {
		omitDefaultItems: true
	},
	this.model = {
		visible: true,
		items: [
			{label: "Home", command: 'do-Home'},
			{label: "Reload", command: 'do-Reload'},
			{label: "Preferences", command: 'do-Prefs'},
			{label: "Share", command: 'do-Share'},
		]
	}); 

	/* add command menu buttons on Touchpad */
	var isTouchpad = false;
	if (Mojo.Environment.DeviceInfo.platformVersionMajor >= 3)
		isTouchpad = true;
	this.controller.setupWidget(Mojo.Menu.commandMenu,
		this.attributes = {
			spacerHeight: 0,
			menuClass: 'no-fade'
		},
		this.model = {
			visible: isTouchpad,
			items: [
				{icon: "back", command: "do-Back"}
			]
		}
	  ); 
		
	/* update the app info using values from our app */
	
	/* add event handlers to listen to events from widgets */
	
};

MainAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */

	   Mojo.Event.listen(this.controller.get("web-view"), Mojo.Event.webViewTitleUrlChanged, this.titleUrlChanged.bind(this));
};

/* the following section enables the back gesture (or back Button on TouchPad) */
MainAssistant.prototype.handleCommand = function(event) {
	if (event.command == "do-Home") {
		this._lastURL = this._homeURL;
		this.controller.get('web-view').mojo.openURL(this._homeURL);
		event.stop();
    }
    else if (event.type == Mojo.Event.back || event.command == "do-Back") {
		this.controller.get('web-view').mojo.goBack();
		event.stop();
    }
	else if (event.command == "do-Reload") {
		this.controller.get('web-view').mojo.reloadPage();
		event.stop();
	}
	else if (event.command == "do-Prefs") {
		this.controller.get('web-view').mojo.openURL(this._prefsURL);
		event.stop();
	}
	else if (event.command == "do-Share") {
		this.share(); 
		event.stop();
	}
};

MainAssistant.prototype.titleUrlChanged = function(event) {
	if (event.url != this._lastURL) {
		Mojo.Log.info("URL Changed " + event.url);
		this._lastURL = event.url;
	}
	event.stop();
}

/* share last url via email */
MainAssistant.prototype.share = function(event) {
	if (this._lastURL != this._homeURL && this._lastURL != this._prefsURL) {
		var shareURL = this._lastURL.replace(this._baseURL, "");
		shareURL = decodeURIComponent(shareURL);
		Mojo.Log.info("Sharing decoded url of last visited article: " + shareURL);

		var message = "Here's an article I think you might like: <br><br>" + shareURL;
		this.controller.serviceRequest("palm://com.palm.applicationManager", {
			method: 'open',
			parameters: {
				id: "com.palm.app.email",
				params: {
					summary: "Check out this article",
					text: message
				}
			}
		});
	} else {
		Mojo.Controller.errorDialog("Nothing to share yet! Load an article first...")
	}
}

MainAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	   Mojo.Event.stopListening(this.controller.get("web-view"), Mojo.Event.webViewLinkClicked, this.handleWebViewNavigation.bind(this));
};

MainAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */

	/* clear the webview cache on exit -- otherwise the webview will always return cached versions of your pages and you'll never see updated versions */
	this.controller.get('web-view').mojo.clearCache(); 
};
/**
 * jquery ui plugin for Facebook friend picking
 *
 * @author darius
					 Armaan Ahluwalia
 */

(function($) {
	$.widget('ui.facebookFriendPicker', $.ui.dialog, {
		
		/*********************************
			VARS
		*********************************/		
		
		_hasBeenInitialized : false,
		_hasPreSelects : null,
		_preSelected : null,
		_searchTerm : null,
		_allFriends : null,		
		_selectedFriends: null,
		_preSelectedLookupObj : null,		
		_friendsLookupObj : null,
		_hasGroups : null,
		_groups : null,
		_selectedGroup : null,		
		_target : null,
		
		options: {
			urlFacebookScript:'http://connect.facebook.net/en_US/all.js'
		},
		
		/*********************************
			OUR FUNCTIIONS
		*********************************/		
		
		_create: function() {
			return $.ui.dialog.prototype._create.apply(this, arguments);
		},
		
		_init: function(){
			return $.ui.dialog.prototype._init.apply(this, arguments);
		},
		
		/** Initialise the widget
		*/
		_appInit : function(callback) {
			var self = this;
			
			this._target = $(this.element).addClass('fb-friend-picker');
			this._hasGroups = (this.options.groups) ? true : false;			
			this._hasPreSelects = (this.options.preSelected) ? true : false;
			this._selectedGroup = -1;
			this._searchTerm = "";			
			_options = this.options;
			
			$.getScript(this.options.urlFacebookScript, function() {
				$('body').prepend('<div id="fb-root"></div>');
				
				FB.init({
					appId: _options.appId,
					cookie : true,
					status: true
				});
				self._fbLogin.apply(self);
			});			
		},
		
		/** Login to Facebook 
		*/		
		_fbLogin: function(){
			var self = this;
			self.element.addClass('loading');
			FB.login(function(response) {
				if(response.status == "connected"){  //response.scope && response.scope.indexOf('user_photos') != -1){
					self.element.addClass('loading');
					FB.api('/me/friends', function(response) {
  					self.element.removeClass('loading');
						if (response.data) {
							self._setupData(response.data);
							self._initRender(response.data);
						} else {
							console.error('failed getting friend list');
						}
					});
				}else{
				  self.element.removeClass('loading');
					console.error('login fail!');
					self.close();
				}
			});
		},
		/** Setup our internal data structures
		*/		
		_setupData : function(data) {
			this._friendsLookupObj = {};
			this._preSelectedLookupObj = {};
			this._allFriends = [];
			this._selectedFriends = [];
			this._preSelected = this.options.preSelected;

			//Setup our internal data structure to hold all friends						
			for(var j in data) { 
				var friend  = data[j];				
				this._friendsLookupObj[friend.id.toString()] = friend.name;
					
				this._allFriends.push(
					{
						name: friend.name,
						id: friend.id.toString()
					}
				);
			};
			
			//Handle Preselects
			if(this._hasPreSelects) {
				// only allow one selection if singleSelect is true
				if(this.options.singleSelect && this.options.preSelected.length > 1) {
				  this.options.preSelected = this.options.preSelected.slice(0,1);
				}

				var preSelects = this.options.preSelected;
				
				for(var i=0; i < preSelects.length; i++) {
				  var friendName = this._friendsLookupObj[preSelects[i].toString()];
					this._preSelectedLookupObj[preSelects[i].toString()] = friendName;
					this._selectedFriends.push({
					  id: preSelects[i],
					  name: friendName
					});
				}
			};
			//Setup our internal data structure to hold the groups			
			if(this.options.groups) {
				var ctr = 0;
				this._groups = [];
				var groups = this.options.groups;
				
				for (var i in groups) {
					this._groups[ctr] = { name : i };
					this._groups[ctr].friends = [];
					var group = groups[i];
					for(var j=0; j<group.length; j++) {
						this._groups[ctr].friends.push(
							{
								name: this._friendsLookupObj[group[j]],
								id: group[j].toString()
							}
						)
					}
					ctr++;
				}
			}
		},
		
		/** Our initialisation function to render 
				layout stuff when fb is all logged in
		*/
		_initRender : function(friend_data) {
			var self = this,
					$markup = $('<div>', {'class': 'container'}),
					$utils = $('<div>', {'class': 'utils'}),
					$nav = $('<div>', {'class' : 'nav'}),
					$search = $('<input>', {'class' : 'search'})
						.bind('keyup', function(e) {
							self._searchTerm = $('.search', this.element).val();
							self._populateContent();
						});
			$utils.append($nav, $search);
			$content = $('<div>', {'class' : 'content'});
			$markup.append($utils, $content);
			$(this._target).html($markup);
			
			self._populateNav();
			self._populateContent();
		},
		
		/** Populate the Nav 
		*/
		_populateNav: function(){

			var self = this;
			
			if(this._hasGroups) {
				var theGroups = this._groups,
						$nav = $('.nav', this.element),
						$select = $('<select>', {id : "group-selector"}),
						$all = $('<option>').html("All").data('group-idx', -1).appendTo($select);
				for(var i in theGroups) {
					var $el = $('<option>').html(theGroups[i].name).data('group-idx', i);
					$select.append($el);
				}
				$select.change(function(e) {	
					self._selectedGroup = $('option:selected', this).data('group-idx');
					self._populateContent();
				});				
				
				$nav.append($select);
			}
		},
		
		/** Populate the Content 
		*/
		_populateContent: function(data){
			
			var $target= $('.content', this._target),
					friendData = (this._searchTerm == "" && this._selectedGroup == -1) ? this._getAllFriends() : this._getFilteredFriends(),
					$output = $('<div>'),
					self = this;
			for(var i=0; i<friendData.length; i++) {
				var friend = friendData[i];
				var $el = $('<div>', {href : '#', 'class' : 'friend-row'})
				  .data({
				    "friend-id": friend.id,
				    "friend-name": friend.name
				  });
				$el.append($('<img>', {src: 'http://graph.facebook.com/' + friend.id + '/picture', 'class' : 'friend-pic'}));
				$el.append('<h3>' + friend.name + '</h3>');
				
				var isSelected = (function() {
				  for(var j=0; j<self._selectedFriends.length; j++) {
				    if(self._selectedFriends[j].id === friend.id.toString()) {
				      return true;
				    }
				  }
				  return false;
				})();
				
				if(isSelected) $el.addClass('selected').data('on', true);
				$output.append($el);
				$el.click(function(e) {
					e.preventDefault();
					self._handleSelect(this);
				});
			}
			$target.html($output);
		},		
		
		/*********************************
			EVENT FUNCTIONS
		*********************************/		

		/** Return all friends with preselects in the right order
		*/		
		_getAllFriends: function() {
			var output= [],
					friends;
			
			if(this._hasPreSelects) {
				for(var i in this._preSelectedLookupObj) {
					output.push({
						name : this._preSelectedLookupObj[i],
						id : i
					});
				}
			}
			
			//If the user passed in groups restrict the pool to those users
			friends = (this._selectedGroup !== -1) ? this._groups[this._selectedGroup].friends : this._allFriends;			
			for(var i in friends) {
				if($.inArray(friends[i].id, this._preSelected) == -1) {
					output.push({
						name : friends[i].name,
						id : friends[i].id
					});					
				}
			}
			return output;
		},
		/** Return filtered friends from search
		*/		
		_getFilteredFriends: function() {
			var output= [],
					friends,
					filter = this._searchTerm;
					
			filter = filter.toUpperCase();
			
			//If the user passed in groups restrict the search pool to those users			
			friends = (this._selectedGroup !== -1) ? this._groups[this._selectedGroup].friends : this._allFriends;
			
			var len = friends.length;
			if (filter.length >= 0) {
				for (i = 0 ; i < len; i ++) {
          if(friends[i].name) {
  					var name = friends[i].name.toUpperCase();
  					if (name.indexOf(filter) !== -1) {
  						output.push(friends[i]);
  					}
				  }
				}
			}
			
			return output;
		},
		
		/** Handle when a friend is clicked
		*/		
		_handleSelect : function($el) {
				var self = this;
				$this = $($el);
				
				if(this.options.singleSelect)  { // If the restricting option for selecting only one is enabled
					$('.friend-row', this.element).removeClass('selected')
						.data('on',false);
					this._selectedFriends = [];
				}
				
				// Code to toggle selected
				if(!$this.data('on'))  {
					$this.data('on', true);
					$this.addClass('selected');
					this._selectedFriends.push({
				    id: $this.data('friend-id'),
				    name: $this.data('friend-name')
					});
				}
				else if($this.data('on'))  {
					$this.data('on', false);
					$this.removeClass('selected');
					this._selectedFriends = this._deleteFromArray($this.data('friend-id'), this._selectedFriends);
				}
				
				console.log('clicked', this._selectedFriends, $this);
		},
		
		/*********************************
			HELPERS
		*********************************/		
		_deleteFromArray : function(val, arr) {
			return jQuery.grep(arr, function(value) {
			        return value.id != val;
			      });
		},
		/** Show preloader
		*/		
		_showLoader: function() {
			this.element.css({
				background:'url(' + this.options.loadingImage + ') center no-repeat'
			});
		},
		/** Hide preloader
		*/		
		_hideLoader: function() {
			this.element.css({
				background:'none'
			});
		},
		
		/*********************************
			PUBLIC FUNCTIONS
		*********************************/
		
		/** When the plugin is opened
		*/		
		open: function() {
			if(this._hasBeenInitialized == false) this._appInit();
			this._hasBeenInitialized = true;
			return $.ui.dialog.prototype.open.apply(this, arguments);
		},
		/** Return selected friends
		*/		
		getSelectedFriends: function() {
		  if(this.options.singleSelect && this._selectedFriends.length > 1) {
		    return this._selectedFriends.slice(0,1);
		  }
			return this._selectedFriends;
		},
		/** Resets the plugin
		*/		
		resetFinder : function() {
			this._hasBeenInitialized = false;
		}
	});
})(jQuery);

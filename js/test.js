var user = new User();

user.init();

$('#add-post').click(function(event){
	$('body').click();
	event.stopPropagation();
	if(!$(this).next().is(':visible')){
		$(this).height('120px').siblings().show();
		$('body').one('click', function(){
			$('#add-post').height('20px').siblings().hide();
		});
	}else {
		$('body').click();
	}
});

$('.left-col, .main-col').css('min-height', ($(window).height() - ($('#header').height() + $('#footer').height())));

$('#modal').css({marginLeft: -($('#modal').width()/2)+'px', marginTop: -($('#modal').height()/2)+'px'})

$('#use-default').click(function() {
	$('#modal, #overlay').hide();
	user = new User("test@email.com","images/pic1.jpg","Artem","Elyseev","23","Ukraine","Kiev","Ukrainian");
	user.renderInfo($('.info-container dl'), $('.img-thumbnail'));
	user.save();
});

$('#sing-up').click(function() {
	user = new User();
	user.setProps($('#settings-form').serializeArray());
	user.renderInfo($('.info-container dl'), $('.img-thumbnail'));
	user.save();
	$('#modal, #overlay').hide();
});

$('a[href=#addpost]').click(function() {
	user.wall.addPost();
});

var imageData = '';

function readURL(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
			imageData = e.target.result;
        }

        reader.readAsDataURL(input.files[0]);
    }
	
}

$("#image").change(function(){
    readURL(this);
});

$('a[href=#settings]').click(function() {
	$('#modal, #overlay').show();
});

//USER CONSTRUCTOR

function User(email, image, firstname, lastname, age, country, city, nationality) {
	var self = this;
    self.email = email;
	self.image = image || 'images/nophoto.jpg';
	self.firstName = firstname;
	self.lastName = lastname;
	self.fullname = self.firstName + " " + self.lastName; 
    self.age = age;
    self.country = country;
    self.city = city;
    self.nationality = nationality;
	self.wall = new Wall('#add-post');
	self.init = init;
	self.renderInfo = renderInfo;
	self.setProps = setProps;
	self.save = save;
	
	function init() {
		if (localStorage['_user']) {
			
			var user_data = JSON.parse( localStorage.getItem( '_user' ) );
			var _data = [];
			for(key in user_data) {
				var o = {
					name: key,
					value: user_data[key]
				}
				_data.push(o);
			}
			self.setProps(_data);
			self.renderInfo($('.info-container dl'), $('.img-thumbnail'));
			self.wall = new Wall('#add-post');
			if (localStorage['_wall']) {
				self.wall.renderWall();
			}
			$('#use-default').hide();
			$('#sing-up').text('Save');
			$('#modal, #overlay').hide();
		}
	}
	
	function setProps(data) {
		for(var i=0; i<data.length; i++) {
			self[data[i].name] = data[i].value;
		}
		if (self.image) {
			if (imageData) {
				self.image = imageData;
			}
		} else {
			if (imageData) {
				self.image = imageData;
			} else {
				self.image = 'images/nophoto.jpg';
			}
		}
		self.fullname = self.firstName + " " + self.lastName;
	}
	function renderInfo($obj, $image) {
		for(prop in self) {
			var prop = prop;
			if (typeof(self[prop]) == "string") {
				$obj.children('dt').each(function() {
					var text = $(this).text().toLowerCase();
					if (text == prop.toLowerCase()) {
						$(this).next().text(self[prop]);
					}
				});
			}
		}
		$image.attr('src', this.image);
	}
	
	function save() {
		localStorage.setItem( '_user', JSON.stringify( self ) );
	}
}

//WALL CONSTRUCTOR

function Wall(textareaID) {
    //this.amount = amount;
	this.posts = [];
	this.textareaID = textareaID;
	this.addPost = addPost;
	this.deletePost = deletePost;
	this.save = save;
	this.renderWall = renderWall;
	
	function addPost() {
		var _post = new Post(this.textareaID, 0);
		this.posts.push(_post);
		_post.renderPost($('.comments'), this);
		$(this.textareaID).height('20px').val('').siblings().hide();
		this.save();
	};
	
	function deletePost($obj) {
		var index = this.posts.indexOf($obj);
		if (index == -1) return;
		this.posts.splice(index, 1);
		this.save();
	};
	
	function save() {
		var JSONposts = [];
		for(var i=0; i<this.posts.length; i++) {
			var o = {
				text: this.posts[i].text,
				like: this.posts[i].like
			}
			JSONposts.push(o);
		}
		localStorage.setItem( '_wall', JSON.stringify( JSONposts ) );
	};
	
	function renderWall() {
		var _data = JSON.parse( localStorage.getItem( '_wall' ) );
		for(var i=0; i<_data.length; i++) {
			var _post = new Post(this.textareaID, 0);
			for(key in _data[i]) {
				_post[key] = _data[i][key];
			}
			this.posts.push(_post);
			_post.renderPost($('.comments'), this);
		}
	};
}

//POST CONSTRUCTOR

function Post(textareaID, like) {
	this.DOM = document.createElement('li');
	this.text = $(textareaID).val();
	this.like = like;
	this.renderPost = renderPost;
	this.removePost = removePost;
	this.likePost = likePost;
	
	
	function renderPost($obj, parent) {
		var that = this;
		this.DOM.className = 'comment level1 clearfix';
		this.DOM.innerHTML = '<a href="#remove" class="remove-post" title="Some tooltip text!">'+
			'<span class="glyphicon glyphicon-remove"></span>'+
		'</a>'+
		'<div class="img-container col-md-2">'+
			'<img class="img-thumbnail" src="'+user.image+'"/>'+
		'</div>'+
		'<div class="comment-container col-md-10">'+
			'<p>'+this.text+'</p>'+
			'<ul class="links list-inline">'+
				'<li><a href="#comment">Comment</a></li>'+
				'<li><a class="like-post" href="#like">Like ('+this.like+')</a></li>'+
			'</ul>'+
		'</div>';
		$(this.DOM).find('.like-post').click(function() {
			that.likePost($(this));
			parent.save();
		});
		$(this.DOM).find('.remove-post').click(function() {
			that.removePost(parent);
			parent.save();
		});
		$obj.prepend(this.DOM);
	};
	
	function removePost(parent) {
		$(this.DOM).remove();
		parent.deletePost(this);
	}
	
	function likePost($obj) {
		this.like++;
		$obj.text('Like ('+this.like+')');
	};
	
}



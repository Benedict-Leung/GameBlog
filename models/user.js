
class User {
    _uuid;
    _username;
    _pass;
    _imageString;
    _blogs = [];

    User(uuid=null, username, pass, imageString='', blogs=[]){
        this._uuid = uuid;
        this._username = username;
        this._pass = pass;
        this._imageString = imageString;
        this._blogs = blogs;
    }

    getUuid(){
        return this._uuid;
    }

    getUserName(){
        return this._username;
    }

    getImage(){
        return this._imageString;
    }

    getBlogs(){
        return this._blogs
    }

    toJson(){
        return{
            'username': this._username,
            'password' : this._pass,
            'imageString': this._imageString,
            'blogs': this._blogs
        }
    }

    static fromJsonFactory(object){
        return User(object.username, object.pass, object.imageString, object.blogs);
    }

}


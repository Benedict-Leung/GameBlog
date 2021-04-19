class Blog {

    constructor(title, date, description, text, uuid=null, blogid=null){
        this._title = title;
        this._date = date;
        this._description = description;
        this._text = text;
        this._uuid = uuid;
        this._blogid = blogid;
    }

    toJson(){
        return{
            'title': this._title,
            'date' : this._date,
            'description': this._description,
            'text': this._text,
        }
    }

    static fromJsonFactory(object){
        if (object.date == undefined)
            object.date = new Date();
        return createInstance(object);
    }

}

function createInstance(object){
    const returnBlog = new Blog(object.title, object.date, object.description, object.text, object.uuid, object._id);
    return returnBlog;
}

module.exports = Blog;

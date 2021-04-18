class Blog {

    constructor(title, date, description, uuid=null, blogid=null){
        this._title = title;
        this._date = date;
        this._description = description;
        this._uuid = uuid;
        this._blogid = blogid;
    }

    toJson(){
        return{
            'title': this._title,
            'date' : this._date,
            'description': this._description,
            'uuid': this._uuid
        }
    }

    static fromJsonFactory(object){
        return createInstance(object);
    }

}

function createInstance(object){
    const returnBlog = new Blog(object.title, object.date, object.description, object.uuid, object._id);
    return returnBlog;
}

module.exports = Blog;

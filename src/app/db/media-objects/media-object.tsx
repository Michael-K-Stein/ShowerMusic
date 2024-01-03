import {MediaId} from "./media-id";

export default class MediaObject 
{
    id: MediaId;

    constructor(id: MediaId)
    {
        this.id = id;
    };
};

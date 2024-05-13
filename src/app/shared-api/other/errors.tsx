
export class ClientError extends Error
{
    status?: string;
    constructor(message?: string)
    {
        super(message);
        this.status = message;
        this.name = 'ClientError';
    }
};

export class ServerNetworkError extends ClientError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'ServerNetworkError';
    }
}

export class ClientApiError extends ClientError
{
    constructor(message?: string | ClientApiError)
    {
        super(typeof message === 'string' ? message : message?.message);
        if (typeof message === 'string')
        {
            this.name = 'ClientApiError';
        }
        else if (message)
        {
            this.name = message.name;
            if (message.status !== undefined)
            {
                this.status = message.status;
            }
        }
    }
}


export class UserNotLoggedInError extends ClientApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'UserNotLoggedInError';
    }
};


export function constructErrorFromNetworkMessage(networkMessage: ClientApiError): ClientApiError
{
    return new ClientApiError(networkMessage);
}

export class ApiNotImplementedError extends ClientApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'ApiNotImplementedError';
    }
};
export class TrackApiError extends ClientApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'TrackApiError';
    }
};

export class TrackNotFoundError extends TrackApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'TrackNotFoundError';
    }
}

export class AlbumApiError extends ClientApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'AlbumApiError';
    }
};
export class AlbumNotFoundError extends AlbumApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'AlbumNotFoundError';
    }
}

export class ArtistApiError extends ClientApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'ArtistApiError';
    }
};

export class ArtistNotFoundError extends ArtistApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'ArtistNotFoundError';
    }
}

export class ApiSearchError extends ClientApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'ApiSearchError';
    }
}

export class PlaylistApiError extends ClientApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'PlaylistApiError';
    }
}

export class InvalidPlaylistNameError extends PlaylistApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'InvalidPlaylistNameError';
    }
}

export class StationApiError extends PlaylistApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'StationApiError';
    }
}

export class StationTrackSwitchRequestTooEarlyError extends StationApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'StationTrackSwitchRequestTooEarlyError';
    }
}

export class StationQueueIsEmptyError extends StationApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'StationQueueIsEmptyError';
    }
}

export class PlaylistCreationError extends PlaylistApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'PlaylistCreationError';
    }
}

export class PlaylistNotFoundError extends PlaylistApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'PlaylistNotFoundError';
    }
}

export class StationNotFoundError extends StationApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'StationNotFoundError';
    }
}

export class InvalidTargetTypeError extends ClientApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'InvalidTargetTypeError';
    }
}

export class InvalidTargetIdError extends ClientApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'InvalidTargetIdError';
    }
}

export class InvalidSourceTypeError extends ClientApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'InvalidSourceTypeError';
    }
}

export class InvalidSourceIdError extends ClientApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'InvalidSourceIdError';
    }
}

export class InvalidParameterCombinationError extends ClientApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'InvalidParameterCombinationError';
    }
}

export class ItemAlreadyExistsError extends ClientApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'ItemAlreadyExistsError';
    }
}

export class LyricsNotFoundError extends ClientApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'LyricsNotFoundError';
    }
}

export class CategoryApiError extends ClientApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'CategoryApiError';
    }
}

export class CategoryNotFoundError extends CategoryApiError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'CategoryNotFoundError';
    }
}

export class SecurityCheckError extends ClientError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'SecurityCheckError';
    }
}

export class MaliciousActivityError extends SecurityCheckError
{
    constructor(message?: string)
    {
        super(message);
        this.name = 'MaliciousActivityError';
    }
}
import { ApiStatusCodes } from "@/app/settings";
import { ApiResponseJson } from "@/app/shared-api/other/common";

export class ClientError extends Error { };
export class ClientApiError extends ClientError { };

export function safeFetcher(input: RequestInfo, init?: RequestInit | undefined): Promise<Response | false>
{
    return fetch(input, init)
        .catch((reason) =>
        {
            return false;
        });
}

export function safeApiFetcher(input: RequestInfo, init?: RequestInit | undefined): Promise<any | false>
{
    return safeFetcher(input, init)
        .then((response) =>
        {
            if (response === false) { return response; }
            return response.json()
                .then((data: ApiResponseJson) =>
                {
                    if (data.status === ApiStatusCodes.STATUS_SUCCESS)
                    {
                        return data.data;
                    }
                    else if (data.status === ApiStatusCodes.STATUS_ERROR)
                    {
                        throw new ClientApiError(data.error);
                    }
                    else
                    {
                        throw new ClientError(`Api response format not recognized! Data: ${data}`);
                    }
                })
                .catch((e) =>
                {
                    if (e instanceof ClientApiError)
                    {
                        console.log(`[ClientApiError] ${e}`);
                    }
                    else if (e instanceof ClientError)
                    {
                        console.log(`[ClientError] ${e}`);
                    }
                    else
                    {
                        console.log(`Api json error: ${e}`);
                    }
                    return false;
                });
        });
}

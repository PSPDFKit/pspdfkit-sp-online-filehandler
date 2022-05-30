import { IronSession } from "iron-session";
import { NextApiRequest } from "next";

export interface IActivationProps {
    appId: string;
    client: string;
    cultureName: string;
    domainHint: string;
    /**
     * array of urls
     */
    items: string[];
    userId: string;
    token: string;
    fetchUrl: string;
}

export interface NextApiRequestWithSession extends NextApiRequest {
    session: IronSession;
}

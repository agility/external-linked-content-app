export interface AgilityUser {
	userID: 1704,
	userName: string
	emailAddress: string
	firstName: string
	lastName: string
	isSuspended: boolean
	isProfileComplete: boolean
	currentWebsite: string,
	userTypeID: number
	timeZoneRegion: string
	websiteAccess: WebsiteAccess[
	],
	jobRole: null,
	createdDate: null
}

export interface WebsiteAccess {
	orgCode: string
	orgName: string
	websiteName: string
	websiteNameStripped: string
	displayName: string | null | undefined
	guid: string
	websiteID: number
	isCurrent: boolean,
	managerUrl: string
	version: string
	isOwner: boolean
	isDormant: boolean
	isRestoring: boolean,
	teamID: number | null
}
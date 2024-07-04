import useSWR from "swr"
import * as agilitySDK from "@agility/management-sdk"
import { getMgmtAPIURL } from "@/lib/getMgmtAPIURL"


interface Props {
	token: string
	guid: string | null | undefined,
	container: agilitySDK.Container,
	locale: string | null | undefined,
	skip: number,
	take: number
	filter: string | undefined
}


interface ContentListFilters {
	modifiedByIds?: number[],
	stateIds?: number[],
	dateRange?: { startDate: string, endDate: string },
	fieldFilters?: any[],
	genericSearch?: string
	SortIDs?: number[]
}

export default function useItemListing({ token, guid, locale, container, skip, take, filter }: Props) {

	const referenceName = container.referenceName

	const fields = ["contentItemID", "itemContainerID", "stateID", "state"].concat(container.columns.filter(f => f.fieldName).map(f => f.fieldName || "") || [])
	const sortField = container.defaultSortColumn
	const sortDirection = container.defaultSortDirection


	const key = `/api/get-listing-${guid}-${referenceName}-${locale}-${skip}-${take}-${filter}`
	const { data, error, isLoading } = useSWR(key, async () => {

		if (!guid || !referenceName || !locale || !token) return null

		const queryStrings = `fields=${fields}&sortDirection=${sortDirection}&sortField=${sortField}&take=${take}&skip=${skip}`
		const url = `${getMgmtAPIURL(guid)}instance/${guid}/${locale}/list/${referenceName}?${queryStrings}`


		const body = {
			modifiedByIds: [],
			stateIds: [],
			dateRange: {},
			fieldFilters: [],
			genericSearch: filter
		}

		const res = await fetch(url, {
			method: "POST",
			body: JSON.stringify(body),
			headers: { Authorization: `BEARER ${token}`, 'Content-Type': 'application/json' }
		})


		const data = await res.json()
		return data

	})

	return {
		fields,
		data,
		isLoading,
		error
	}

}
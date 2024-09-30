import useSWR from "swr"
import { LinkedItem } from "@/types/LinkedItem"

import * as agilitySDK from "@agility/management-sdk"
import { ContentItem } from "@agility/management-sdk"

interface Props {
	token: string | null
	guid: string
	locale: string
	contentID: number
}

/**
 * Get the full content item details
 * @param param0
 * @returns
 */
export default function useItemDetails({ token, guid, locale, contentID }: Props) {


	const key = `/api/get-item-${token}-${guid}-${locale}-${contentID}`

	const { data, error, isLoading } = useSWR(key, async () => {

		if (!guid || !token || !locale || contentID < 1) return null

		let options = new agilitySDK.Options()
		options.token = token

		const api = new agilitySDK.ApiClient(options)
		return api.contentMethods.getContentItem(contentID, guid, locale)

	}, {
		refreshInterval: 10000
	})

	return {
		itemDetail: data,
		isLoading,
		error
	}

}
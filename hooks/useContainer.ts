import useSWR from "swr"
import * as agilitySDK from "@agility/management-sdk"

interface Props {
	token: string | null | undefined
	guid: string | null | undefined
	referenceName: string | null | undefined
}


export default function useContainer({ token, guid, referenceName }: Props) {


	const key = `/api/get-container-${guid}-${referenceName}`
	const { data, error, isLoading } = useSWR(key, async () => {

		if (!guid || !token || !referenceName) return null

		let options = new agilitySDK.Options()
		options.token = token

		const api = new agilitySDK.ApiClient(options)
		const container = await api.containerMethods.getContainerByReferenceName(referenceName, guid)

		if (container && !container.columns) {
			container.columns = [
				{ fieldName: "title", label: "Title", sortOrder: null, isDefaultSort: null, sortDirection: null, typeName: null },
				{ fieldName: "state", label: "State", sortOrder: null, isDefaultSort: null, sortDirection: null, typeName: null },
				{ fieldName: "createddate", label: "Modified On", sortOrder: null, isDefaultSort: null, sortDirection: null, typeName: null },
				{ fieldName: "username", label: "Modified By", sortOrder: null, isDefaultSort: null, sortDirection: null, typeName: null },
			]
		}

		return container


	})

	return {
		data,
		isLoading,
		error
	}

}
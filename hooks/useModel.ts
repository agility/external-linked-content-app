import useSWR from "swr"
import * as agilitySDK from "@agility/management-sdk"

interface Props {
	token: string | null | undefined
	guid: string | null | undefined
	referenceName: string | null | undefined
}


export default function useModel({ token, guid, referenceName }: Props) {


	const key = `/api/get-model-${guid}-${referenceName}`
	const { data, error, isLoading } = useSWR(key, async () => {

		if (!guid || !token || !referenceName) return null

		let options = new agilitySDK.Options()
		options.token = token

		const api = new agilitySDK.ApiClient(options)
		const model = await api.modelMethods.getModelByReferenceName(referenceName, guid)

		return model


	})

	return {
		data,
		isLoading,
		error
	}

}
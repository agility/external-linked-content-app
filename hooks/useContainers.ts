import useSWR from "swr"
import * as agilitySDK from "@agility/management-sdk"

interface Props {
	token: string
	guid: string | null | undefined
}


export default function useContainers({ token, guid }: Props) {


	const key = `/api/get-containers-${guid}`
	const { data, error, isLoading } = useSWR(key, async () => {

		if (!guid || !token) return null

		let options = new agilitySDK.Options()
		options.token = token

		const api = new agilitySDK.ApiClient(options)

		return api.containerMethods.getContainerList(guid)


	})

	return {
		data,
		isLoading,
		error
	}

}
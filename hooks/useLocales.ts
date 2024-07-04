import useSWR from "swr"
import * as agilitySDK from "@agility/management-sdk"
import { getMgmtAPIURL } from "@/lib/getMgmtAPIURL"

interface Props {
	token: string
	guid: string | null | undefined
}


export default function useLocales({ token, guid }: Props) {


	const key = `/api/get-locales-${guid}`
	const { data, error, isLoading } = useSWR(key, async () => {

		if (!guid || !token) return null

		const url = `${getMgmtAPIURL(guid)}instance/${guid}/locales`

		const res = await fetch(url, {
			method: "GET",
			headers: { Authorization: `BEARER ${token}`, 'Content-Type': 'application/json' }
		})


		const data = await res.json()
		return data


	})

	return {
		data,
		isLoading,
		error
	}

}
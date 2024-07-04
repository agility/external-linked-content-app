import useSWR from "swr"
import * as agilitySDK from "@agility/management-sdk"

import { AgilityUser } from "@/types/AgilityUser"

interface Props {
	token: string

}


export default function useCurrentUser({ token }: Props) {


	const key = `/api/get-current-user`
	const { data, error, isLoading } = useSWR(key, async () => {

		if (!token) return null

		const url = "https://mgmt.aglty.io/api/v1/users/me"

		const res = await fetch(url, {
			method: "GET",
			headers: { Authorization: `BEARER ${token}` }
		})

		if (!res.ok) {
			throw new Error("Error fetching user")
		}

		const data = await res.json()
		return data as AgilityUser


	})

	return {
		data,
		isLoading,
		error
	}

}
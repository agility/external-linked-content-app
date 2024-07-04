/* eslint-disable @next/next/no-img-element */
"use client"

import {ContainerSelector} from "@/components/ContainerSelector"
import {InstanceSelector} from "@/components/InstanceSelector"
import ItemListing from "@/components/ItemListing"
import {LocaleSelector} from "@/components/LocaleSelector"
import useContainer from "@/hooks/useContainer"
import {SelectedValue} from "@/types/SelectedValue"

import {useAgilityAppSDK, closeModal, getManagementAPIToken} from "@agility/app-sdk"
import {Button} from "@agility/plenum-ui"
import {useEffect, useMemo, useState} from "react"
import useSWR from "swr"

export default function SelectBigCommerceProduct() {
	const {initializing, modalProps} = useAgilityAppSDK()

	let token: string | null = modalProps?.token || null

	//pull the guid, referenceName, and locale from the modalProps if possible
	const [guid, setGuid] = useState<string | null>(null)
	const [referenceName, setReferenceName] = useState<string | null>(null)
	const [locale, setLocale] = useState<string | null>(null)

	const {data: container, isLoading: loadingContainer} = useContainer({token, guid, referenceName})

	useEffect(() => {
		if (!modalProps) return

		if (modalProps.guid && !guid) {
			setGuid(modalProps.guid)
		}
		if (modalProps.referenceName && !referenceName) {
			setReferenceName(modalProps.referenceName)
		}
		if (modalProps.locale && !locale) {
			setLocale(modalProps.locale)
		}
	}, [guid, locale, modalProps, referenceName])

	if (initializing) {
		return null
	}

	//TODO: pull the store and access_token from the appInstallContext
	return (
		<div className="h-full flex flex-col">
			<div className="flex-1 min-h-0 ">
				{token && (
					<>
						{!guid && (
							<InstanceSelector
								token={token}
								onSelect={(ret) => {
									setGuid(ret.guid)
								}}
							/>
						)}

						{guid && !locale && (
							<LocaleSelector
								guid={guid}
								token={token}
								onSelect={(locale) => {
									setLocale(locale)
								}}
							/>
						)}

						{guid && !referenceName && locale && (
							<ContainerSelector
								guid={guid}
								token={token}
								onSelect={(container) => {
									setReferenceName(container.referenceName)
								}}
							/>
						)}

						{guid && referenceName && !container && loadingContainer && <div>Accessing list details...</div>}

						{guid && container && locale && (
							<ItemListing
								token={token}
								guid={guid}
								locale={locale}
								container={container}
								onSelectItem={(item) => {
									closeModal({
										item,
										guid,
										referenceName,
										locale,
									} as SelectedValue)
								}}
							/>
						)}
					</>
				)}
			</div>
		</div>
	)
}

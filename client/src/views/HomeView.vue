<template>
	<div>
		<h1>Welcome, {{ store.user?.username }}</h1>
	</div>
</template>

<script setup>
import { useMainStore } from '@/stores/store';

	const store = useMainStore();
</script>

<style scoped></style>
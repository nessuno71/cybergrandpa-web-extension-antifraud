<script lang="ts">
  import { type RadioProps } from '@/utils';
  import { camelCase } from 'change-case';
  import { nanoid } from 'nanoid';

  let { label, group = $bindable(), checked, value }: RadioProps = $props();

  const suffix = nanoid(4);
  const id = $derived(camelCase(['radio', label, group, value, '_', suffix].join(' ')));
</script>

<input {id} type="radio" class="css-radio" {checked} bind:group {value} />
<label for={id}>{label}</label>

<style lang="scss">
  .css-radio {
    position: absolute;
    overflow: hidden;
    clip: rect(0 0 0 0);
    height: 0.0625rem;
    width: 0.0625rem;
    margin: -0.0625rem;
    padding: 0;
    border: 0;
    appearance: none;
  }

  .css-radio + label {
    position: relative;
    font-size: 1rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    height: 1.25rem;
    margin-left: 1rem;
  }

  .css-radio + label::before {
    content: ' ';
    display: inline-block;
    vertical-align: middle;
    margin-right: 0.4rem;
    width: 1.125rem;
    height: 1.125rem;
    background-color: white;
    border-width: 0.0625rem;
    border-style: solid;
    border-color: rgb(204, 204, 204);
    border-radius: 1.625rem;
    box-shadow: none;
  }

  .css-radio:checked + label::after {
    content: ' ';
    background-color: light-dark(#edd308, var(--background-color-dark));
    border-radius: 100%;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 0rem;
    left: 0.325rem;
    top: 0.325rem;
    text-align: center;
    font-size: 0.625rem;
    height: 0.6rem;
    width: 0.6rem;
  }
</style>
